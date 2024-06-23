import {
  RoutePath,
  SwapRouter,
  SwapRouterOptions,
  LiquidityPairType,
  SwapRouterSwapOptions,
  SwapRouterDetectSlippageOptions,
  QuoteResult,
} from './SwapRouter'
import { Contract } from 'ethers'
import { Provider, TransactionResponse } from '@ethersproject/providers'
import { ContractInterface } from '@ethersproject/contracts'
import { UniswapV2Router02, UniswapV2Factory, UniswapV2Pair, ERC20 } from '../../contracts/external_contracts.json'
import { ETH_ADDRESS, ZERO_ADDRESS } from '../../constants'
import { getContractByAddress } from '../../util'
import { tokenPresets } from '../token-presets'
import { getNetworkDataByChainId } from '@onlymoons-io/networks'
import { formatUnits } from 'ethers/lib/utils'

const { abi: ERC20ABI } = ERC20
const { abi: UniswapV2Router02ABI } = UniswapV2Router02
const { abi: UniswapV2FactoryABI } = UniswapV2Factory
const { abi: UniswapV2PairABI } = UniswapV2Pair

const DEFAULT_FEE_CONSTANT = BigInt(3000)

export interface UniswapV2RouterOptions extends Omit<SwapRouterOptions, 'routerAbi' | 'factoryAbi' | 'pairAbi'> {
  routerAbi?: ContractInterface
  factoryAbi?: ContractInterface
  pairAbi?: ContractInterface
}

export class UniswapV2Router extends SwapRouter {
  constructor({
    feeConstant = DEFAULT_FEE_CONSTANT,
    routerAbi = UniswapV2Router02ABI,
    factoryAbi = UniswapV2FactoryABI,
    pairAbi = UniswapV2PairABI,
    ...rest
  }: UniswapV2RouterOptions) {
    super({ routerAbi, factoryAbi, pairAbi, feeConstant, ...rest })
  }

  public async getPairAddress(
    router: Contract,
    factory: Contract,
    token0: string,
    token1: string,
    _fee?: bigint,
  ): Promise<string | undefined> {
    const { chainId } = await router.provider.getNetwork()
    const cached = SwapRouter._pairCache
      .getState()
      .getCachedPair(chainId, router.address, token0, token1, this._feeConstant ?? DEFAULT_FEE_CONSTANT)
    if (cached) return cached.pairAddress

    try {
      return await SwapRouter._requestQueue.add(() => factory.getPair(token0, token1))
    } catch (_err) {
      return undefined
    }
  }

  protected async _getWethAddress(router: Contract): Promise<string> {
    if (this._wethAddress) return this._wethAddress
    try {
      // try to get the actual WETH address used on the router
      this._wethAddress = await SwapRouter._requestQueue.add(() => router.WETH())
      return this._wethAddress as string
    } catch (_err) {
      // return undefined
    }
    // attempt fallback - return ZERO_ADDRESS on failure
    const { chainId } = await router.provider.getNetwork()
    this._wethAddress = getNetworkDataByChainId(chainId)?.nativeCurrency.address ?? ZERO_ADDRESS
    return this._wethAddress
  }

  public getApprovalAddress() {
    return this._routerAddress
  }

  public async swap({
    provider,
    path,
    priority,
    amountInput,
    minimumReceived,
    deadline,
    spoof = false,
    onReceipt,
  }: SwapRouterSwapOptions): Promise<Array<bigint> | undefined> {
    const address = await provider.getAddress()
    const router = this.getRouterContract(provider)
    const routes = [...path]
    let tx: unknown = undefined
    if (routes[0].token0 === ETH_ADDRESS) {
      // we don't need the eth route. get rid of it.
      // it only exists so we can make this detection.
      const _ethRoute = routes.shift()
      const firstPath = routes.shift() as RoutePath
      const pathAddressArray = [firstPath.token0, firstPath.token1, ...routes.map(({ token1 }) => token1)]
      if (priority === 0) {
        if (spoof) {
          console.log('spoof tx with priority 0')
          try {
            tx = await SwapRouter._requestQueue.add(() =>
              router.callStatic.swapExactETHForTokens(minimumReceived, pathAddressArray, address, deadline, {
                value: amountInput,
              }),
            )
          } catch (err) {
            //
          }

          if (!tx) {
            tx = await SwapRouter._requestQueue.add(() =>
              router.callStatic.swapExactETHForTokensSupportingFeeOnTransferTokens(
                minimumReceived,
                pathAddressArray,
                address,
                deadline,
                { value: amountInput },
              ),
            )
          }
        } else {
          tx = await SwapRouter._requestQueue.add(() =>
            router.functions.swapExactETHForTokensSupportingFeeOnTransferTokens(
              minimumReceived,
              pathAddressArray,
              address,
              deadline,
              { value: amountInput },
            ),
          )
        }
      } else {
        // TODO confirm this works on tokens with fees
        //  since there is swapExactETHForTokensSupportingFeeOnTransferTokens,
        //  i expect there to be an equivalent here, but there isn't.
        tx = await router.functions.swapEthForExactTokens(minimumReceived, pathAddressArray, address, deadline, {
          value: amountInput,
        })
      }
    } else if (routes[routes.length - 1].token1 === ETH_ADDRESS) {
      // we don't need the eth route. get rid of it.
      // it only exists so we can make this detection.
      const _ethRoute = routes.pop()
      const firstPath = routes.shift() as RoutePath
      const pathAddressArray = [firstPath.token0, firstPath.token1, ...routes.map(({ token1 }) => token1)]
      if (priority === 0) {
        if (spoof) {
          try {
            tx = await SwapRouter._requestQueue.add(() =>
              router.callStatic.swapExactTokensForTokens(
                amountInput,
                minimumReceived,
                pathAddressArray,
                address,
                deadline,
              ),
            )
          } catch (_err) {
            //
          }

          if (!tx) {
            tx = await SwapRouter._requestQueue.add(() =>
              router.callStatic.swapExactTokensForETHSupportingFeeOnTransferTokens(
                amountInput,
                minimumReceived,
                pathAddressArray,
                address,
                deadline,
              ),
            )
          }
        } else {
          tx = await router.functions.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountInput,
            minimumReceived,
            pathAddressArray,
            address,
            deadline,
          )
        }
      } else {
        // TODO confirm this works on tokens with fees
        //  since there is swapExactTokensForETHSupportingFeeOnTransferTokens,
        //  i expect there to be an equivalent here, but there isn't.
        tx = await router.functions.swapTokensForExactEth(
          minimumReceived,
          amountInput,
          pathAddressArray,
          address,
          deadline,
        )
      }
    } else {
      const firstPath = routes.shift() as RoutePath
      const pathAddressArray = [firstPath.token0, firstPath.token1, ...routes.map(({ token1 }) => token1)]
      if (priority === 0) {
        if (spoof) {
          try {
            tx = await router.callStatic.swapExactTokensForTokens(
              amountInput,
              minimumReceived,
              pathAddressArray,
              address,
              deadline,
            )
          } catch (err) {
            //
          }

          if (!tx) {
            tx = await router.callStatic.swapExactTokensForTokensSupportingFeeOnTransferTokens(
              amountInput,
              minimumReceived,
              pathAddressArray,
              address,
              deadline,
            )
          }
        } else {
          tx = await router.functions.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amountInput,
            minimumReceived,
            pathAddressArray,
            address,
            deadline,
          )
        }
      } else {
        // TODO confirm this works on tokens with fees
        //  since there is swapExactTokensForTokensSupportingFeeOnTransferTokens,
        //  i expect there to be an equivalent here, but there isn't.
        tx = await router.functions.swapTokensForExactTokens(
          minimumReceived,
          amountInput,
          pathAddressArray,
          address,
          deadline,
        )
      }
    }

    if (tx) {
      if (spoof) {
        onReceipt && onReceipt({ response: tx })
        // in case it returns a BigNumber or number, make it a bigint
        return ((tx ?? []) as Array<bigint>).map((amount) => BigInt(amount.toString()))
      } else {
        // store the tx so we can track it.
        // do this async so we can return as soon as the tx was sent.
        const receipt = await (tx as TransactionResponse).wait()
        onReceipt && onReceipt({ response: tx as TransactionResponse, receipt })
        // can we return amounts here?
        return undefined
      }
    }
  }

  public async detectSlippage({
    minSlippage = 0.1,
    maxSlippage = 35,
    minimumReceived,
    ...swapOptions
  }: SwapRouterDetectSlippageOptions): Promise<number> {
    console.log('DETECT SLIPPAGE')
    let currentSlippage = minSlippage
    for (; currentSlippage <= maxSlippage; currentSlippage = Math.floor(currentSlippage + 1)) {
      try {
        await this.swap({
          ...swapOptions,
          minimumReceived:
            minimumReceived - (minimumReceived * BigInt(Math.floor(currentSlippage * 10000))) / BigInt(1000000),
          spoof: true,
        })
      } catch (_err) {
        // console.log(_err)
        continue
      }
      break
    }

    // if we're above minimum, provide minimum as headroom
    return currentSlippage === minSlippage ? minSlippage : Math.floor(currentSlippage + minSlippage)
  }

  protected async _getPriceImpactForRoutePath(
    provider: Provider,
    router: Contract,
    factory: Contract,
    path: RoutePath,
    inputAmount: bigint,
    outputAmount: bigint,
  ): Promise<number> {
    const { token0: token0Address, token1: token1Address } = path
    const token0 = getContractByAddress(token0Address, ERC20ABI, provider)
    const token1 = getContractByAddress(token1Address, ERC20ABI, provider)
    const [balance0, balance1, decimals0, decimals1] = await Promise.all([
      SwapRouter._requestQueue.add(() => token0.functions.balanceOf(path.pairAddress) as Promise<bigint>),
      SwapRouter._requestQueue.add(() => token1.functions.balanceOf(path.pairAddress) as Promise<bigint>),
      // TODO we can use cached decimals value here probably
      SwapRouter._requestQueue.add(() => token0.functions.decimals() as Promise<number>),
      SwapRouter._requestQueue.add(() => token1.functions.decimals() as Promise<number>),
    ])
    if (balance0 !== undefined && balance1 !== undefined && decimals0 !== undefined && decimals1 !== undefined) {
      const amount0Float = parseFloat(formatUnits(balance0.toString(), decimals0))
      const amount1Float = parseFloat(formatUnits(balance1.toString(), decimals1))
      const marketPrice = amount1Float / amount0Float
      const inputAmountFloat = parseFloat(formatUnits(inputAmount.toString(), decimals0))
      const outputAmountFloat = parseFloat(formatUnits(outputAmount.toString(), decimals1))
      const quotedPriceFloat = outputAmountFloat / inputAmountFloat
      const feeFloat = parseFloat(path.fee.toString()) / 10000
      return (1 - quotedPriceFloat / marketPrice) * 100 - feeFloat
    }
    return 0
  }

  public async getPriceImpacts(
    provider: Provider,
    path: Array<RoutePath>,
    amountInput: bigint,
    outputAmounts: Array<bigint>,
  ): Promise<{ total: number; impacts: Array<number> }> {
    if (path.length !== outputAmounts.length) throw new Error('PATH_AMOUNTS_MUST_MATCH')
    const router = this.getRouterContract(provider)
    const factory = await this.getFactoryContract(provider, router)
    const impacts = await Promise.all(
      path.map((routePath, index) =>
        this._getPriceImpactForRoutePath(
          provider,
          router,
          factory,
          routePath,
          index === 0 ? amountInput : outputAmounts[index - 1],
          outputAmounts[index],
        ),
      ),
    )
    const { total } = impacts.reduce(
      ({ total, remaining }, value) => {
        const p = remaining * (value / 100)
        return {
          total: total + p,
          remaining: remaining - p,
        }
      },
      { total: 0, remaining: 100 },
    )
    return { total, impacts }
  }

  public async quoteOut(provider: Provider, amountInput: bigint, path: Array<RoutePath>): Promise<Array<QuoteResult>> {
    const router = this.getRouterContract(provider)
    const containsEth = SwapRouter.pathContainsEth(path)
    // only make async contract call if needed
    const wethAddress = containsEth ? await this._getWethAddress(router) : undefined
    const isWrapOrUnwrap = SwapRouter.isWrapOrUnwrap(path, wethAddress)
    if (isWrapOrUnwrap) return path.map(() => ({ amount: amountInput, impact: 0 }))
    const pathArray = [...path]
    const firstPath = pathArray.shift() as RoutePath
    const pathAddressArray = [firstPath.token0, firstPath.token1, ...pathArray.map(({ token1 }) => token1)].map(
      (tokenAddress) => (wethAddress && tokenAddress === ETH_ADDRESS ? wethAddress : tokenAddress),
    )
    const amounts: Array<bigint> = (
      await SwapRouter._requestQueue.add(() => router.getAmountsOut(amountInput, pathAddressArray))
    ).slice(1)
    return amounts.map((amount) => ({ amount, impact: 0 }))
  }

  public async quoteIn(provider: Provider, amountOutput: bigint, path: Array<RoutePath>): Promise<Array<QuoteResult>> {
    const router = this.getRouterContract(provider)
    const containsEth = SwapRouter.pathContainsEth(path)
    // only make async contract call if needed
    const wethAddress = containsEth ? await this._getWethAddress(router) : undefined
    const isWrapOrUnwrap = SwapRouter.isWrapOrUnwrap(path, wethAddress)
    if (isWrapOrUnwrap) return path.map(() => ({ amount: amountOutput, impact: 0 }))
    const pathArray = [...path]
    const firstPath = pathArray.shift() as RoutePath
    const pathAddressArray = [firstPath.token0, ...pathArray.map(({ token1 }) => token1)].map((tokenAddress) =>
      wethAddress && tokenAddress === ETH_ADDRESS ? wethAddress : tokenAddress,
    )
    const amounts: Array<bigint> = await SwapRouter._requestQueue.add(() =>
      router.getAmountsIn(amountOutput, pathAddressArray),
    )
    // return amounts.length !== 0 ? amounts[0] : BigInt(0)
    return amounts.map((amount) => ({ amount, impact: 0 }))
  }

  public async getPresetPairs<PairType = LiquidityPairType>(
    provider: Provider,
    tokenAddress: string,
  ): Promise<Array<PairType>> {
    const router = this.getRouterContract(provider)
    const [{ chainId }, factory] = await Promise.all([provider.getNetwork(), this.getFactoryContract(provider, router)])
    const tokenPresetAddresses = tokenPresets[chainId] ?? []
    const theTokenAddress = tokenAddress === ETH_ADDRESS ? await this._getWethAddress(router) : tokenAddress
    const pairAddresses: Array<LiquidityPairType> =
      ((
        await Promise.all(
          tokenPresetAddresses
            .filter((otherToken) => theTokenAddress !== otherToken)
            .map(
              (otherToken) =>
                new Promise<LiquidityPairType | undefined>((resolve, reject) => {
                  this.getPairAddress(router, factory, theTokenAddress, otherToken)
                    .then((pairAddress) => {
                      if (!pairAddress || pairAddress === ZERO_ADDRESS) {
                        resolve(undefined)
                      } else {
                        const cached = SwapRouter._pairCache
                          .getState()
                          .getCachedPair(
                            chainId,
                            router.address,
                            theTokenAddress,
                            otherToken,
                            this._feeConstant ?? DEFAULT_FEE_CONSTANT,
                          )
                        if (cached) {
                          resolve(cached)
                        } else {
                          const liquidityPair: LiquidityPairType = {
                            pairAddress,
                            thisToken: theTokenAddress,
                            otherToken,
                            fee: this._feeConstant ?? DEFAULT_FEE_CONSTANT,
                          }
                          SwapRouter._pairCache.getState().setCachedPair(chainId, router.address, liquidityPair)
                          resolve(liquidityPair)
                        }
                      }
                    })
                    .catch(reject)
                }),
            ),
        )
      ).filter((pair) => pair?.pairAddress && pair.pairAddress !== ZERO_ADDRESS) as Array<LiquidityPairType>) ?? []
    return pairAddresses as Array<PairType>
  }
}
