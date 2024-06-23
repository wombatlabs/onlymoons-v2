import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Root, SwapInfoSection, TopArea } from './styles'
import { QuoteType, SwapSectionComponent } from './SwapSectionComponent'
import { NavigateOptions, useParams } from 'react-router'
import { getNetworkDataByChainId } from '@onlymoons-io/networks'
import { useWeb3React } from '@web3-react/core'
import { useNavigate } from 'react-router-dom'
import { ETH_ADDRESS } from '../../constants'
import { SwapRouter } from '../../data/SwapRouters'
import { useDarkMode } from 'use-dark-mode-ts'
import { DexScreenerPair } from '../../types'
import { SwapRouteData } from './SwapRouteData'

const navigateOptions: NavigateOptions = {
  replace: true,
  preventScrollReset: true,
}

export const SwapPageComponent: FC = () => {
  const { chainId } = useWeb3React()
  // TODO make this work on other chains! our names from networks module do not match dexscreener names
  const dexScreenerChainId = useMemo<string | undefined>(() => {
    switch (chainId) {
      default:
        return undefined
      case 1:
        return 'ethereum'
      case 137:
        return 'polygon'
      case 8453:
        return 'base'
    }
  }, [chainId])
  const isDarkMode = useDarkMode()
  const { chainId: chainIdFromUrl, from, to } = useParams()
  const navigate = useNavigate()
  /** exists for forwarding url. maybe find a way to delete. */
  const [fromAddress, setFromAddress] = useState<string | undefined>(from)
  /** exists for forwarding url. maybe find a way to delete. */
  const [toAddress, setToAddress] = useState<string | undefined>(to)
  const [{ router: swapRouter, quote }, setQuote] = useState<{ router?: SwapRouter; quote?: QuoteType }>({})
  const [dexScreenerPairs, setDexScreenerPairs] = useState<Array<DexScreenerPair>>([])
  const chartAddress = useMemo<string | undefined>(() => {
    console.log('dexScreenerPairs', dexScreenerPairs)
    if (dexScreenerChainId && dexScreenerPairs?.length)
      return `https://dexscreener.com/${dexScreenerChainId}/${dexScreenerPairs[0].pairAddress}?embed=1&theme=${
        isDarkMode ? 'dark' : 'light'
      }&trades=1&info=0`
    return undefined
  }, [dexScreenerPairs, isDarkMode, dexScreenerChainId])
  const theFromAddress = useMemo<string | undefined>(() => from ?? fromAddress, [from, fromAddress])
  const theToAddress = useMemo<string | undefined>(() => to ?? toAddress, [to, toAddress])

  useEffect(() => {
    if (chainId) {
      if (swapRouter && quote?.quote?.path) {
        console.log('quote path', quote.quote.path)
        // calculate pairs based on quoted path
        Promise.all(
          quote.quote.path
            .filter(({ token0, token1 }) => token0 !== ETH_ADDRESS && token1 !== ETH_ADDRESS)
            // only check the first pair for now.
            // we may want to comment this in the future.
            // .filter((_, index) => index === 0)
            .map(({ pairAddress }) => {
              console.log('look for pair address', pairAddress)
              return fetch(`https://api.dexscreener.com/latest/dex/pairs/${dexScreenerChainId}/${pairAddress}`)
                .then((response) => response.json() as Promise<{ pair: DexScreenerPair }>)
                .then(({ pair }) => {
                  console.log('found dexscreener pair', pair)
                  return pair
                })
            }),
        )
          .then(setDexScreenerPairs)
          .catch((err) => {
            console.log(err)
            setDexScreenerPairs([])
          })
      } else {
        if (theFromAddress && theToAddress) {
          // calculate pair based on from/to combo
        } else {
          setDexScreenerPairs([])
        }
      }
    } else {
      setDexScreenerPairs([])
    }
  }, [chainId, dexScreenerChainId, theFromAddress, theToAddress, swapRouter, quote?.quote?.path])

  useEffect(() => {
    if (chainId) {
      const networkData = getNetworkDataByChainId(chainId)
      if (networkData) {
        const { urlName } = networkData
        if (fromAddress && toAddress) {
          navigate(`/swap/${urlName}/${fromAddress}/${toAddress}`, navigateOptions)
        } else if (fromAddress && !toAddress) {
          navigate(`/swap/${urlName}/${fromAddress}`, navigateOptions)
        } else if (!fromAddress && toAddress) {
          navigate(`/swap/${urlName}/undefined/${toAddress}`, navigateOptions)
        }
      }
    }
  }, [chainId, fromAddress, toAddress])

  return (
    <Root>
      <TopArea>
        <div className={'flex flex-col gap-2 overflow-auto'}>
          <SwapSectionComponent
            targetChainId={chainIdFromUrl ? Number(chainIdFromUrl) : undefined}
            from={fromAddress ?? from}
            to={toAddress ?? to}
            onFromAddressChange={setFromAddress}
            onToAddressChange={setToAddress}
            onQuoteChange={useCallback((router?: SwapRouter, quote?: QuoteType) => setQuote({ router, quote }), [])}
          />
          <SwapRouteData router={swapRouter} quote={quote} pairs={dexScreenerPairs} />
        </div>

        <SwapInfoSection>
          {chartAddress && (
            <div className={'grow w-full flex items-stretch justify-center'}>
              <iframe className={'w-full outline-none'} src={chartAddress}></iframe>
            </div>
          )}
        </SwapInfoSection>
      </TopArea>
      {/*<BottomArea>*/}
      {/*  <TransfersSection>Recent transfers?</TransfersSection>*/}
      {/*</BottomArea>*/}
    </Root>
  )
}
