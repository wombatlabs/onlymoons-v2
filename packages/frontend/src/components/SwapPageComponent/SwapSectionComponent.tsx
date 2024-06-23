import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SwapDetailItem, SwapDetails, SwapRow, SwapSection, SwapTokenDirectionArrow, SwapTokens } from './styles'
import { TokenAmountInput } from '../TokenAmountInput'
import { RxArrowDown, RxExclamationTriangle, RxReload, RxWidth } from 'react-icons/rx'
import { getNetworkDataByChainId, TokenData } from '@onlymoons-io/networks'
import { BigNumber, BigNumberish } from 'ethers'
import { Button } from '../Button'
import { useLocale, useSettings, useSwapState } from '../../state/stores'
import { useTokenCache } from '../../providers/Web3/TokenCacheProvider'
import { useWeb3React } from '@web3-react/core'
import { ETH_ADDRESS } from '../../constants'
import { swapRouters } from '../../data/swap-routers'
import {
  RoutePath,
  SwapRouter,
  SwapRouterSwapOptions,
  UniswapV2Router /* UniswapV3Router */,
} from '../../data/SwapRouters'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { ERC20 } from '../../contracts/external_contracts.json'
import {
  getContractByAddress,
  getExplorerLink,
  getPrecisionForNumberString,
  getShortAddress,
  isNumeric,
} from '../../util'
import { Colors, ExtendedTokenData, ImpactLevel } from '../../types'
import { StyledAnchor } from '../StyledAnchor'
import { HumanReadableTokenAmount } from '../HumanReadableTokenAmount'
import { Input } from '../Input'

const { abi: ERC20ABI } = ERC20

const UPDATE_QUOTES_ON_BLOCK_DELAY = 500
const FETCH_QUOTE_DELAY = 0
/** signifies 100% with 4 decimals */
const MAX_FEE = BigInt(1000000)

// TODO move
export type QuoteType = {
  direction?: 0 | 1
  quote?: { path: Array<RoutePath>; amount: bigint; impact: number }
  amounts?: Array<bigint>
}

export interface SwapSectionComponentProps {
  targetChainId?: number
  from?: string
  to?: string
  onFromAddressChange?: (address?: string) => void
  onToAddressChange?: (address?: string) => void
  onQuoteChange?: (router?: SwapRouter, quote?: QuoteType) => void
}

export const SwapSectionComponent: FC<SwapSectionComponentProps> = ({
  targetChainId,
  from,
  to,
  onFromAddressChange,
  onToAddressChange,
  onQuoteChange,
}) => {
  const { getString: s } = useLocale()
  const { swapSlippage, setSwapSlippage, autoSwapSlippage, setAutoSwapSlippage } = useSettings()
  const { account, chainId, provider } = useWeb3React()
  /** exists for forwarding url. maybe find a way to delete. */
  const [fromAddress, setFromAddress] = useState<string | undefined>(from)
  /** exists for forwarding url. maybe find a way to delete. */
  const [toAddress, setToAddress] = useState<string | undefined>(to)
  const { getTokenData } = useTokenCache()
  const {
    //
    token0,
    token1,
    amount0,
    amount1,
    tokenPriority,
    setTokenPriority,
    setToken0,
    setToken1,
    setAmount0,
    setAmount1,
    reverse,
  } = useSwapState()
  const [token0Approved, setToken0Approved] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [{ quote, router: swapRouter, direction: quoteDirection, amounts: quoteAmounts }, setQuote] = useState<{
    direction?: 0 | 1
    router?: SwapRouter
    quote?: { path: Array<RoutePath>; amount: bigint; impact: number }
    amounts?: Array<bigint>
  }>({})
  const [{ total: quotedPriceImpactTotal, impacts: quotedPriceImpacts }, setQuotedPriceImpact] = useState<{
    total?: number
    impacts?: Array<number>
  }>({})
  const [fetchingQuote, setFetchingQuote] = useState<boolean>(false)
  const fetchingQuoteRef = useRef<boolean>(fetchingQuote)
  const swapReady = useMemo<boolean>(() => {
    return !!(token0 && token1 && amount0 && amount1 && swapRouter && quotedPriceImpactTotal)
  }, [token0, token1, amount0, amount1, swapRouter, quotedPriceImpactTotal])
  const lpFee = useMemo<bigint | undefined>(() => {
    if (!quote?.path.length) {
      return undefined
    }
    return quote.path
      .map(({ fee }) => fee)
      .reduce(
        ({ total, remaining }, value) => {
          const fee = (remaining * value) / MAX_FEE
          return { total: total + fee, remaining: remaining - fee }
        },
        { total: BigInt(0), remaining: MAX_FEE },
      ).total
  }, [quote?.path])
  const [detectedSlippage, setDetectedSlippage] = useState<number>()
  const [detectingSlippage, setDetectingSlippage] = useState<boolean>(false)
  const minimumReceived = useMemo<bigint | undefined>(() => {
    if (!amount1 || !token1 || lpFee === undefined) {
      return undefined
    }
    let baseAmount: bigint | undefined
    try {
      baseAmount =
        (BigInt(parseUnits(amount1.toString(), token1.decimals).toString()) *
          BigInt(Math.floor((100 - (detectedSlippage ?? swapSlippage)) * 10000))) /
        BigInt(1000000)
    } catch (_err) {
      baseAmount = undefined
    }
    return baseAmount
  }, [amount1, token1, swapSlippage, lpFee, detectedSlippage])
  const swapOptions = useMemo<SwapRouterSwapOptions | undefined>(() => {
    if (swapRouter && provider && token0 && token1 && amount0 && amount1 && quote?.path && minimumReceived) {
      return {
        provider: provider.getSigner(),
        path: (() => {
          if (token0.address === ETH_ADDRESS) {
            return [{ token0: ETH_ADDRESS, token1: quote.path[0].token0, fee: BigInt(0) } as RoutePath, ...quote.path]
          } else if (token1.address === ETH_ADDRESS) {
            return [
              ...quote.path,
              {
                token0: quote.path[quote.path.length - 1].token1,
                token1: ETH_ADDRESS,
                fee: BigInt(0),
              } as RoutePath,
            ]
          }
          return quote.path
        })(),
        priority: tokenPriority,
        amountInput: BigInt(parseUnits(amount0, token0.decimals).toString()),
        minimumReceived,
        deadline: BigInt(Math.ceil(Date.now() / 1000 + 60 * 5)),
        onReceipt: ({ response, receipt }) => {
          console.log('received response', Array.isArray(response) ? response.map((item) => item.toString()) : response)
          console.log('received receipt', receipt)
        },
      }
    } else {
      return undefined
    }
  }, [swapRouter, provider, token0?.address, token1?.address, amount0, amount1, quote?.path, minimumReceived])
  // const [routerPath, setRouterPath] = useState<Array<RoutePath> | undefined>()
  const [routerPathTokenData, setRouterPathTokenData] = useState<Array<ExtendedTokenData>>()
  const isWrap = useMemo<boolean>(() => {
    if (!chainId || !token0 || !token1) return false
    const { nativeCurrency } = getNetworkDataByChainId(chainId) ?? {}
    if (!nativeCurrency) return false
    return token0.address === ETH_ADDRESS && token1.address === nativeCurrency.address
  }, [chainId, token0?.address, token1?.address])
  const isUnwrap = useMemo<boolean>(() => {
    if (!chainId || !token0 || !token1) return false
    const { nativeCurrency } = getNetworkDataByChainId(chainId) ?? {}
    if (!nativeCurrency) return false
    return token0.address === nativeCurrency.address && token1.address === ETH_ADDRESS
  }, [chainId, token0?.address, token1?.address])
  const lastBlockProcessed = useRef<number>()
  const lastToken0 = useRef<string>()
  const lastToken1 = useRef<string>()
  const lastAmount0 = useRef<string>()
  const lastAmount1 = useRef<string>()
  const lastDetectedSlippage = useRef<number | undefined>(detectedSlippage)
  const lastAutoSwapSlippage = useRef<boolean>()
  const impactLevel = useMemo<ImpactLevel | undefined>(() => {
    switch (true) {
      case quotedPriceImpactTotal && quotedPriceImpactTotal >= 15:
        return 'high'
      case quotedPriceImpactTotal && quotedPriceImpactTotal >= 5:
        return 'medium'
      case !!quotedPriceImpactTotal:
        return 'low'
      default:
        return undefined
    }
  }, [quotedPriceImpactTotal])
  const [exchangeRateDirection, setExchangeRateDirection] = useState<0 | 1>(1)
  const exchangeRate = useMemo<string | undefined>(() => {
    if (swapReady && amount0 && amount1 && token0 && token1) {
      let t0: TokenData
      let t1: TokenData
      let a0: string
      let a1: string
      if (exchangeRateDirection === 0) {
        t0 = token0
        t1 = token1
        a0 = amount0
        a1 = amount1
      } else {
        t0 = token1
        t1 = token0
        a0 = amount1
        a1 = amount0
      }
      let formatted: string | undefined
      try {
        const exchangeRateValue = parseFloat(
          formatUnits(
            parseUnits(a0.toString(), t0.decimals)
              .mul(BigNumber.from(10).pow(18))
              .div(parseUnits(a1.toString(), t1.decimals)),
            18,
          ),
        )
        formatted = `${exchangeRateValue.toLocaleString(undefined, {
          maximumFractionDigits: getPrecisionForNumberString(exchangeRateValue),
        })} ${t0.symbol} per ${t1.symbol}`
      } catch (_err) {
        formatted = undefined
      }
      return formatted
    } else {
      return undefined
    }
  }, [swapReady, amount0, amount1, token0, token1, exchangeRateDirection])

  useEffect(() => {
    if (!quote?.path || quoteDirection === undefined || !swapRouter) {
      onQuoteChange && onQuoteChange(undefined)
    } else {
      onQuoteChange &&
        onQuoteChange(swapRouter, {
          quote: {
            path: quote.path,
            amount: quote.amount,
            impact: quote.impact,
          },
          direction: quoteDirection,
        })
    }
  }, [quote, quoteDirection, swapRouter])

  useEffect(() => {
    const thisToken0 = token0?.address
    const thisToken1 = token1?.address
    const token0Changed = thisToken0 !== lastToken0.current
    const token1Changed = thisToken1 !== lastToken1.current
    if (provider && account && autoSwapSlippage && swapRouter && swapOptions && quote) {
      if (
        autoSwapSlippage !== lastAutoSwapSlippage.current ||
        (tokenPriority === 0 && (token0Changed || amount0 !== lastAmount0.current)) ||
        (tokenPriority === 1 && token1Changed) ||
        amount1 !== lastAmount1.current
      ) {
        setDetectingSlippage(true)
        const paths = [...quote.path]
        // throwaway
        // TODO find out why this is never defined when it should be!
        const _ethPath = paths[0].token0 === ETH_ADDRESS ? paths.shift() : undefined
        const detectSlippage = () => {
          swapRouter
            .detectSlippage({ ...swapOptions, minimumReceived: quote.amount })
            .then((slippage) => {
              lastDetectedSlippage.current = slippage
              setDetectedSlippage(slippage)
            })
            .catch((_err) => {
              // console.log(err)
            })
            .then(() => {
              setDetectingSlippage(false)
            })
        }
        if (!token0 || !paths[0]) {
          console.log('WTF!')
          setDetectedSlippage(undefined)
          setDetectingSlippage(false)
        } else if (token0?.address === ETH_ADDRESS) {
          detectSlippage()
        } else {
          const tokenToApprove = getContractByAddress(paths[0].token0, ERC20ABI, provider)
          Promise.all([
            tokenToApprove.functions.decimals() as Promise<number>,
            tokenToApprove.functions.allowance(account, swapRouter.getApprovalAddress()) as Promise<bigint>,
          ])
            .then(([decimals, allowance]) => {
              if (
                (tokenPriority === 0 &&
                  allowance >= BigInt(parseUnits(amount0?.toString() ?? '0', decimals).toString())) ||
                (tokenPriority === 1 &&
                  allowance >= BigInt(parseUnits(amount1?.toString() ?? '0', decimals).toString()))
              ) {
                detectSlippage()
              } else {
                setDetectedSlippage(undefined)
                setDetectingSlippage(false)
              }
            })
            .catch(() => {
              setDetectedSlippage(undefined)
              setDetectingSlippage(false)
            })
        }
      }
    } else if (token0Changed || token1Changed) {
      setDetectedSlippage(undefined)
      setDetectingSlippage(false)
    }
    lastAutoSwapSlippage.current = autoSwapSlippage
  }, [
    provider,
    account,
    autoSwapSlippage,
    swapRouter,
    swapOptions,
    quote,
    token0?.address,
    token1?.address,
    amount0,
    amount1,
    tokenPriority,
  ])

  useEffect(() => {
    if (token0 && token1 && amount0 && amount1) {
      if (tokenPriority === 0 && amount0 !== lastAmount0.current) {
        lastBlockProcessed.current = undefined
      } else if (tokenPriority === 1 && amount1 !== lastAmount1.current) {
        lastBlockProcessed.current = undefined
      }
    } else {
      lastBlockProcessed.current = undefined
    }
    lastToken0.current = token0?.address
    lastToken1.current = token1?.address
    lastAmount0.current = amount0
    lastAmount1.current = amount1
  }, [token0?.address, token1?.address, amount0, amount1, tokenPriority])

  useEffect(() => {
    if (chainId && quote && swapRouter) {
      const tokensInRoute = [
        ...new Set(quote.path.map((path) => [path.token0, path.token1]).reduce((acc, pair) => [...acc, ...pair], [])),
      ]
      Promise.all(tokensInRoute.map((tokenAddress) => getTokenData(tokenAddress, chainId)).filter((result) => !!result))
        .then((results) => setRouterPathTokenData(results as Array<ExtendedTokenData>))
        .catch((err: Error) => {
          console.log(err)
          setRouterPathTokenData(undefined)
        })
    } else {
      setRouterPathTokenData(undefined)
    }
  }, [chainId, quote, swapRouter])

  useEffect(() => {
    if (account && token0 && amount0 && provider && swapRouter) {
      if (token0.address === ETH_ADDRESS) {
        setToken0Approved(true)
      } else {
        const tokenContract = getContractByAddress(token0.address, ERC20ABI, provider)
        tokenContract
          .allowance(account, swapRouter.getApprovalAddress())
          .then((allowance: BigNumberish) => {
            setToken0Approved(
              BigInt(allowance.toString()) >= BigInt(parseUnits(amount0.toString(), token0.decimals).toString()),
            )
          })
          .catch((err: Error) => {
            console.log(err)
            setToken0Approved(false)
          })
      }
    } else {
      setToken0Approved(false)
    }
  }, [account, token0?.address, amount0, provider, swapRouter])

  useEffect(() => {
    if (chainId && !!(from && from !== 'undefined')) {
      if (from === ETH_ADDRESS) {
        const networkDataForChainId = getNetworkDataByChainId(chainId)
        if (networkDataForChainId) {
          setToken0({ ...networkDataForChainId.nativeCurrency, address: ETH_ADDRESS })
        }
      } else {
        getTokenData(from, chainId).then(setToken0).catch(console.log)
      }
    }
  }, [chainId, from])

  useEffect(() => {
    if (chainId && !!(to && to !== 'undefined')) {
      if (to === ETH_ADDRESS) {
        const networkDataForChainId = getNetworkDataByChainId(chainId)
        if (networkDataForChainId) {
          setToken1({ ...networkDataForChainId.nativeCurrency, address: ETH_ADDRESS })
        }
      } else {
        getTokenData(to, chainId).then(setToken1).catch(console.log)
      }
    }
  }, [chainId, to])

  useEffect(() => {
    onFromAddressChange && onFromAddressChange(fromAddress)
  }, [fromAddress])

  useEffect(() => {
    onToAddressChange && onToAddressChange(toAddress)
  }, [toAddress])

  const getQuote = useCallback(
    async (theRouter: SwapRouter, route: Array<RoutePath>): Promise<QuoteType> => {
      if (provider && theRouter && token0 && token1) {
        if (tokenPriority === 0 && amount0) {
          const theQuote = await theRouter.quoteOut(
            provider,
            BigInt(parseUnits(amount0.toString(), token0.decimals).toString()),
            route,
          )
          // TODO determine if this is being called too frequently
          //  it sure seems like it
          // console.log('theQuote', theQuote)
          return {
            quote: theQuote
              .map((thisQuote) => ({
                path: route,
                amount: BigInt(thisQuote.amount.toString()),
                impact: thisQuote.impact,
              }))
              .pop(), // or shift?
            direction: 1,
            amounts: theQuote.map(({ amount }) => amount),
          }
        } else if (tokenPriority === 1 && amount1) {
          const theQuote = await theRouter.quoteOut(
            provider,
            BigInt(parseUnits(amount1.toString(), token1.decimals).toString()),
            route,
          )
          return {
            quote: theQuote
              .map((thisQuote) => ({
                path: route,
                amount: BigInt(thisQuote.amount.toString()),
                impact: thisQuote.impact,
              }))
              .pop(), // or shift??
            direction: 0,
            amounts: theQuote.map(({ amount }) => amount),
          }
        }
      }
      return {}
    },
    [provider, token0?.address, token1?.address, amount0, amount1, tokenPriority],
  )

  const updateBestQuote = useCallback(async () => {
    // if (fetchingQuoteRef.current) return
    if (!provider) return
    const block = await provider.getBlockNumber()
    if (block === lastBlockProcessed.current) return
    lastBlockProcessed.current = block
    setFetchingQuote(true)
    if (chainId && swapRouters[chainId] && token0 && token1 && (amount0 || amount1)) {
      function getBestQuoteInArray(arrayOfQuotes: Array<QuoteType>) {
        return arrayOfQuotes.reduce<QuoteType | undefined>((acc, value) => {
          if (!acc?.quote) return value
          const { direction: quoteDirection, quote } = value
          if (quote) {
            if (quoteDirection === 0) {
              return BigInt(quote.amount.toString()) < BigInt(acc.quote.amount.toString()) ? value : acc
            } else if (quoteDirection === 1) {
              return BigInt(quote.amount.toString()) > BigInt(acc.quote.amount.toString()) ? value : acc
            }
          }
          // if we made it this far, we didn't get a hit so return accumulator
          return acc
        }, undefined)
      }

      if (quote && swapRouter) {
        getQuote(swapRouter, quote.path).then((newQuote) =>
          setQuote({
            router: swapRouter,
            direction: newQuote.direction,
            quote: newQuote.quote,
            amounts: newQuote.amounts,
          }),
        )
      } else {
        const routerRoutes = await Promise.all(
          swapRouters[chainId].map(
            (thisRouter) =>
              new Promise<{ router: SwapRouter; routes: RoutePath[][] }>((resolve, reject) => {
                thisRouter
                  .findRoutesForSwap(provider, token0.address, token1.address)
                  .then((routes) =>
                    resolve({
                      router: thisRouter,
                      routes,
                    }),
                  )
                  .catch(reject)
              }),
          ),
        )

        const quotesForRoutes = await Promise.all(
          routerRoutes.map(
            ({ router, routes }) =>
              new Promise<Array<{ router: SwapRouter; quote: QuoteType }>>((resolve) => {
                Promise.all(
                  routes.map(
                    (route) =>
                      new Promise<{ router: SwapRouter; quote?: QuoteType }>((resolve2) =>
                        getQuote(router, route)
                          .then((result) => resolve2({ router, quote: result }))
                          .catch((_err) => {
                            resolve2({ router, quote: undefined })
                          }),
                      ),
                  ),
                )
                  .then(
                    (results) =>
                      results.filter(({ quote }) => !!quote) as Array<{ router: SwapRouter; quote: QuoteType }>,
                  )
                  .then(resolve)
                  .catch((_err) => {
                    resolve([])
                  })
              }),
          ),
        )

        const bestQuotes = quotesForRoutes
          .filter((quotesForRoute) => quotesForRoute.length !== 0)
          .map((quotesForRoute) => ({
            router: quotesForRoute[0].router,
            quote: getBestQuoteInArray(quotesForRoute.map((v) => v.quote)),
          }))
          .filter(({ quote }) => !!quote) as Array<{
          router: SwapRouter
          quote: QuoteType
        }>

        const bestQuote = bestQuotes.find(
          (quote) => quote.quote === getBestQuoteInArray(bestQuotes.map((v) => v.quote)),
        )

        if (bestQuote) {
          setQuote({
            router: bestQuote.router,
            direction: bestQuote.quote.direction,
            quote: bestQuote.quote.quote,
            amounts: bestQuote.quote.amounts,
          })
        } else {
          setQuote({})
        }
      }
    }
    setTimeout(() => setFetchingQuote(false), FETCH_QUOTE_DELAY)
  }, [chainId, getQuote, swapRouters, token0?.address, token1?.address, provider])

  useEffect(() => {
    fetchingQuoteRef.current = fetchingQuote
  }, [fetchingQuote])

  useEffect(() => {
    updateBestQuote().catch(console.log)
  }, [updateBestQuote])

  useEffect(() => {
    if (token0 && token1 && quote && quoteDirection !== undefined) {
      if (quoteDirection === 0) {
        setAmount0(quote ? formatUnits(quote.amount, token0.decimals) : undefined)
      } else {
        setAmount1(quote ? formatUnits(quote.amount, token1.decimals) : undefined)
      }
    }
  }, [token0?.address, token1?.address, quote, quoteDirection])

  useEffect(() => {
    if (provider) {
      let timer: NodeJS.Timeout
      const _provider = provider
      const listener = () => {
        timer && clearTimeout(timer)
        timer = setTimeout(() => {
          !fetchingQuoteRef.current &&
            updateBestQuote().catch((_err) => {
              // console.log(err)
            })
        }, UPDATE_QUOTES_ON_BLOCK_DELAY)
      }
      _provider.on('block', listener)
      return () => {
        _provider.off('block', listener)
        timer && clearTimeout(timer)
      }
    }
  }, [provider, updateBestQuote])

  const makeSwap = useCallback(
    async (spoof = false): Promise<Array<bigint> | undefined> => {
      if (swapRouter && swapOptions) {
        let result: Array<bigint> | undefined

        try {
          result = await swapRouter.swap({ ...swapOptions, spoof })
          console.log('swapped????')
        } catch (err) {
          console.log('error swapping', err)
          result = undefined
        }

        setSubmitting(false)
        return result
      }
    },
    [swapRouter, swapOptions],
  )

  useEffect(() => {
    if (provider && quote && quoteAmounts && swapRouter && amount0 && token0) {
      swapRouter
        .getPriceImpacts(provider, quote.path, BigInt(parseUnits(amount0, token0.decimals).toString()), quoteAmounts)
        .then((priceImpacts) => {
          setQuotedPriceImpact(priceImpacts)
        })
        .catch((err) => {
          console.log(err)
          setQuotedPriceImpact({})
        })
    } else {
      //
      setQuotedPriceImpact({})
    }
  }, [provider, quote, quoteAmounts, swapRouter, amount0, token0])

  return (
    <SwapSection>
      {/*<SwapSectionHeader>Multi-dex multi-hop swap aggregator</SwapSectionHeader>*/}
      {/*<SwapSectionDescription>*/}
      {/*  This swap supports multiple dexes and multiple hops on each dex.*/}
      {/*</SwapSectionDescription>*/}
      <SwapTokens>
        <TokenAmountInput
          token={token0}
          setAmount={amount0}
          onAmountChange={(amount) => {
            SwapRouter.resetQueue()
            setQuote({})
            setTimeout(() => {
              setAmount0(amount)
              setTokenPriority(0)
            }, 50)
          }}
          onTokenChange={(tokenData) => {
            setFromAddress(tokenData?.address)
          }}
        />
        <SwapTokenDirectionArrow onClick={reverse}>
          <RxArrowDown />
        </SwapTokenDirectionArrow>
        <TokenAmountInput
          token={token1}
          setAmount={amount1}
          onAmountChange={(amount) => {
            SwapRouter.resetQueue()
            setQuote({})
            setTimeout(() => {
              setAmount1(amount)
              setTokenPriority(1)
            }, 50)
          }}
          onTokenChange={(tokenData) => {
            setToAddress(tokenData?.address)
          }}
        />
      </SwapTokens>
      <SwapRow>
        <span className={'flex justify-center items-center mr-3'}>Slippage</span>
        <Button
          $color={autoSwapSlippage ? Colors.ghost : Colors.transparent}
          disabled={detectingSlippage}
          onClick={() => setAutoSwapSlippage(true)}
        >
          {s('Auto')}
        </Button>
        <Button
          $color={!autoSwapSlippage && swapSlippage === 0.1 ? Colors.ghost : Colors.transparent}
          disabled={detectingSlippage}
          onClick={() => setSwapSlippage(0.1)}
        >
          0.1%
        </Button>
        <Button
          $color={!autoSwapSlippage && swapSlippage === 1 ? Colors.ghost : Colors.transparent}
          disabled={detectingSlippage}
          onClick={() => setSwapSlippage(1)}
        >
          1%
        </Button>
        <Input
          $size={'lg'}
          $color={Colors.secondary}
          className={'grow ml-1'}
          disabled={detectingSlippage}
          placeholder={detectingSlippage ? s('Detecting...') : swapSlippage?.toString() ?? '0.1'}
          value={`${
            detectedSlippage ? detectedSlippage : swapSlippage && swapSlippage != 0 ? swapSlippage.toString() : ''
          }${detectingSlippage ? `${s(' (updating...)')}` : ''}`}
          onInput={(e) => {
            if (isNumeric(e.currentTarget.value)) {
              setSwapSlippage(
                parseFloat(
                  e.currentTarget.value && e.currentTarget.value !== ''
                    ? e.currentTarget.value.replace(/[^0-9.]/g, '')
                    : '0.1',
                ),
              )
            } else {
              setSwapSlippage(0)
            }
          }}
        />
      </SwapRow>
      <SwapRow>
        <Button
          $size={'lg'}
          $color={Colors.ghost}
          disabled={!quote || submitting || fetchingQuote}
          onClick={() => {
            SwapRouter.resetQueue()
            setQuote({})
            if (tokenPriority === 0) {
              setAmount1(undefined)
            } else if (tokenPriority === 1) {
              setAmount0(undefined)
            }
            setTimeout(() => updateBestQuote().catch(console.log), 50)
          }}
        >
          <RxReload className={`${fetchingQuote ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          disabled={submitting || !swapReady}
          $size={'lg'}
          $color={(() => {
            switch (true) {
              case swapReady:
                switch (impactLevel) {
                  case 'high':
                    return Colors.danger
                  case 'medium':
                    return Colors.warning
                  default:
                    return Colors.success
                }
              default:
                return Colors.ghost
            }
          })()}
          className={'flex justify-center items-center grow'}
          onClick={async () => {
            if (
              chainId &&
              swapReady &&
              token0 &&
              token1 &&
              amount0 &&
              provider &&
              swapRouter &&
              quote?.path &&
              minimumReceived
            ) {
              if (token0Approved) {
                setSubmitting(true)
                makeSwap()
              } else {
                setSubmitting(true)
                try {
                  const tokenContract = getContractByAddress(token0.address, ERC20ABI, provider.getSigner())
                  const tx = await tokenContract.approve(
                    swapRouter.getApprovalAddress(),
                    parseUnits(amount0.toString(), token0.decimals),
                  )
                  await tx.wait()
                } catch (err) {
                  console.log(err)
                }
                setSubmitting(false)
                // getQuote()
              }
            } else {
              console.log('swap was not ready :(')
            }
          }}
        >
          {!swapReady
            ? fetchingQuote
              ? s('Looking for route...')
              : s('Not ready')
            : token0Approved
            ? submitting
              ? s('Swapping...')
              : isWrap
              ? s('Wrap')
              : isUnwrap
              ? s('Unwrap')
              : `${s('Swap')} ${token0?.symbol} ${s('for')} ${token1?.symbol}`
            : submitting
            ? s('Approving...')
            : `${s('Approve')} ${token0?.symbol} on ${swapRouter?.name}`}
        </Button>
      </SwapRow>

      <SwapDetails>
        <SwapDetailItem>
          <span>{s('Router')}</span>
          {chainId && swapReady && swapRouter ? (
            <span className={'flex items-center'}>
              {(() => {
                switch (true) {
                  case swapRouter instanceof UniswapV2Router:
                    return (
                      <span className={'text-xs font-text bg-secondary-200 dark:bg-secondary-500 px-1.5 py-0 mr-2'}>
                        V2
                      </span>
                    )
                  // case swapRouter instanceof UniswapV3Router:
                  //   return (
                  //     <span className={'text-xs font-text bg-secondary-200 dark:bg-secondary-500 px-1.5 py-0 mr-2'}>
                  //       V3
                  //     </span>
                  //   )
                  default:
                    return <></>
                }
              })()}
              {swapRouter.name} (
              <StyledAnchor
                href={getExplorerLink(chainId, `/address/${swapRouter.getApprovalAddress()}`)}
                target={'_blank'}
                rel={'noopener noreferrer'}
              >
                {getShortAddress(swapRouter.getApprovalAddress())}
              </StyledAnchor>
              )
            </span>
          ) : (
            <span>-</span>
          )}
        </SwapDetailItem>
        <SwapDetailItem>
          <span>{s('Exchange rate')}</span>
          <span className={'flex gap-2'}>
            <span>{exchangeRate ?? '-'}</span>
            <Button
              $size={'sm'}
              $color={Colors.ghost}
              className={'px-1.5 py-0'}
              onClick={() => {
                setExchangeRateDirection(exchangeRateDirection === 0 ? 1 : 0)
              }}
            >
              <RxWidth />
            </Button>
          </span>
        </SwapDetailItem>
        <SwapDetailItem>
          <span>{s('Price impact')}</span>
          <span
            className={`flex items-center gap-1 ${(() => {
              if (!swapReady) return ''
              switch (impactLevel) {
                case 'high':
                  return 'font-bold text-red-400 dark:text-red-600'
                case 'medium':
                  return 'font-bold text-yellow-500 dark:text-yellow-600'
                default:
                  return ''
              }
            })()}`}
          >
            {(impactLevel === 'high' || impactLevel === 'medium') && <RxExclamationTriangle />}
            {swapReady && quotedPriceImpactTotal
              ? `${quotedPriceImpactTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
              : '-'}
          </span>
        </SwapDetailItem>
        <SwapDetailItem>
          <span>{s('Slippage')}</span>
          <span>{detectedSlippage ?? swapSlippage}%</span>
        </SwapDetailItem>
        <SwapDetailItem>
          <span>{s('Liquidity provider fee')}</span>
          <span>
            {swapReady && lpFee && token0 && amount0 ? (
              <>
                {/* TODO: make sure this is right */}
                <HumanReadableTokenAmount
                  amount={(BigInt(parseUnits(amount0, token0.decimals).toString()) * lpFee) / MAX_FEE}
                  tokenData={{ ...token0, totalSupply: BigInt(0), balance: BigInt(0) }}
                  displaySymbol={true}
                  displayPercent={false}
                />{' '}
                ({formatUnits(lpFee.toString(), 4)}%)
              </>
            ) : (
              '-'
            )}
          </span>
        </SwapDetailItem>
        <SwapDetailItem>
          <span>{s('Minimum received')}</span>
          <span>
            {swapReady && minimumReceived && token1
              ? `${formatUnits(minimumReceived, token1.decimals)} ${token1.symbol}`
              : '-'}
          </span>
        </SwapDetailItem>
      </SwapDetails>
    </SwapSection>
  )
}
