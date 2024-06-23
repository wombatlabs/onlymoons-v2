import {
  RoutePath,
  SwapRouter,
  SwapRouterOptions,
  LiquidityPairType,
  SwapRouterSwapOptions,
  SwapRouterDetectSlippageOptions,
} from './SwapRouter'
import { Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { BigNumberish, Signer } from 'ethers'
import {
  UniswapV3QuoterV2,
  UniswapV3SwapRouter02,
  UniswapV3Factory,
  UniswapV3Pool,
} from '../../contracts/external_contracts.json'
import { ETH_ADDRESS, ZERO_ADDRESS } from '../../constants'
import { getNetworkDataByChainId } from '@onlymoons-io/networks'
import { getContractByAddress } from '../../util'
import { tokenPresets } from '../token-presets'

const { abi: UniswapV3QuoterV2ABI } = UniswapV3QuoterV2
const { abi: UniswapV3SwapRouter02ABI } = UniswapV3SwapRouter02
const { abi: UniswapV3FactoryABI } = UniswapV3Factory
const { abi: UniswapV3PoolABI } = UniswapV3Pool

export interface UniswapV3RouterOptions extends SwapRouterOptions {
  routerAddress: string
  quoterAddress: string
}

export class UniswapV3Router extends SwapRouter {
  constructor({ routerAddress, quoterAddress, ...rest }: UniswapV3RouterOptions) {
    super({ ...rest })
    this._routerAddress = routerAddress
    this._quoterAddress = quoterAddress
  }

  protected readonly _routerAddress: string
  protected readonly _quoterAddress: string

  protected _getRouterContract(provider: Signer | Provider) {
    return getContractByAddress(this._routerAddress, UniswapV3SwapRouter02ABI, provider)
  }

  protected _getQuoterContract(provider: Signer | Provider) {
    return getContractByAddress(this._quoterAddress, UniswapV3QuoterV2ABI, provider)
  }

  protected async _getFactoryContract(provider: Signer | Provider, router: Contract) {
    return getContractByAddress(
      await SwapRouter._requestQueue.add(() => router.factory()),
      UniswapV3FactoryABI,
      provider,
    )
  }

  public async getPairAddress(
    router: Contract,
    factory: Contract,
    token0: string,
    token1: string,
    fee: bigint,
  ): Promise<string | undefined> {
    const { chainId } = await router.provider.getNetwork()
    const cached = SwapRouter._pairCache.getState().getCachedPair(chainId, router.address, token0, token1, fee)
    if (cached) return cached.pairAddress

    try {
      return await SwapRouter._requestQueue.add(() => factory.getPool(token0, token1, fee))
    } catch (_err) {
      return undefined
    }
  }

  protected _getPairContract(provider: Provider, pairAddress: string) {
    return getContractByAddress(pairAddress, UniswapV3PoolABI, provider)
  }

  protected async _getWethAddress(router: Contract): Promise<string> {
    if (this._wethAddress) return this._wethAddress
    try {
      this._wethAddress = await SwapRouter._requestQueue.add(() => router.WETH9())
      return this._wethAddress as string
    } catch (_err) {
      //
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
    path: _path,
    priority: _priority,
    amountInput: _amountInput,
    minimumReceived: _minimumReceived,
    deadline: _deadline,
    spoof: _spoof = false,
  }: SwapRouterSwapOptions): Promise<Array<bigint> | undefined> {
    const _swapRouter = this._getRouterContract(provider)
    return []
  }

  public async detectSlippage({
    minSlippage: _minSlippage = 0.1,
    maxSlippage: _maxSlippage = 35,
    minimumReceived: _minimumReceived,
    ..._swapOptions
  }: SwapRouterDetectSlippageOptions): Promise<number> {
    return 0
  }

  public async getPriceImpacts(
    _provider: Provider,
    _path: Array<RoutePath>,
    _amountInput: bigint,
    _outputAmounts: Array<bigint>,
  ): Promise<{ total: number; impacts: Array<number> }> {
    return { total: 0, impacts: [] }
  }

  // TODO: ensure this works with multi-hops!
  //  found on stackoverflow, and someone was looking for an answer.
  //  so there is likely an issue here.
  protected static encodePath(path: Array<string>, fees: Array<number | bigint>) {
    const FEE_SIZE = 3

    if (path.length != fees.length + 1) {
      throw new Error('path/fee lengths do not match')
    }

    let encoded = '0x'
    for (let i = 0; i < fees.length; i++) {
      // 20 byte encoding of the address
      encoded += path[i].slice(2)
      // 3 byte encoding of the fee
      encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, '0')
    }
    // encode the final token
    encoded += path[path.length - 1].slice(2)

    return encoded.toLowerCase()
  }

  public async quoteOut(provider: Provider, amountInput: BigNumberish, path: Array<RoutePath>) {
    const { chainId } = await provider.getNetwork()
    const networkData = getNetworkDataByChainId(chainId)
    if (!networkData) throw new Error('INVALID_NETWORK')
    const router = this._getRouterContract(provider)
    const containsEth = SwapRouter.pathContainsEth(path)
    const wethAddress = containsEth ? await this._getWethAddress(router) : undefined
    const isWrapOrUnwrap = SwapRouter.isWrapOrUnwrap(path, wethAddress)
    if (isWrapOrUnwrap) return path.map(() => amountInput)
    const quoter = this._getQuoterContract(provider)
    const pathArray = [...path]
    const firstPath = pathArray.shift() as RoutePath
    const pathAddressArray = [firstPath.token0, firstPath.token1]
    const feesArray = [firstPath.fee]
    // iterate over the remaining pathArray
    pathArray.forEach((thisPath) => {
      pathAddressArray.push(thisPath.token1)
      feesArray.push(thisPath.fee)
    })
    const { amountOut } = (await SwapRouter._requestQueue.add(() =>
      quoter.callStatic.quoteExactInput(UniswapV3Router.encodePath(pathAddressArray, feesArray), amountInput),
    )) as {
      amountOut: BigNumberish
    }
    // v2 returned an array here, so to keep compatibility, we spoof an array
    return new Array(amountOut ? path.length : 0).fill(amountOut)
  }

  public async quoteIn(provider: Provider, amountOutput: BigNumberish, path: Array<RoutePath>) {
    const { chainId } = await provider.getNetwork()
    const networkData = getNetworkDataByChainId(chainId)
    if (!networkData) throw new Error('INVALID_NETWORK')
    const router = this._getRouterContract(provider)
    const containsEth = SwapRouter.pathContainsEth(path)
    const wethAddress = containsEth ? await this._getWethAddress(router) : undefined
    const isWrapOrUnwrap = SwapRouter.isWrapOrUnwrap(path, wethAddress)
    if (isWrapOrUnwrap) return path.map(() => amountOutput)
    const quoter = this._getQuoterContract(provider)
    const pathArray = [...path].reverse()
    const firstPath = pathArray.shift() as RoutePath
    const pathAddressArray = [firstPath.token0, firstPath.token1]
    const feesArray = [firstPath.fee]
    // iterate over the remaining pathArray
    pathArray.forEach((thisPath) => {
      pathAddressArray.push(thisPath.token1)
      feesArray.push(thisPath.fee)
    })
    const { amountIn } = (await SwapRouter._requestQueue.add(() =>
      quoter.callStatic.quoteExactInput(UniswapV3Router.encodePath(pathAddressArray, feesArray), amountOutput),
    )) as {
      amountIn: bigint
    }
    // v2 returned an array here, so to keep compatibility, we spoof an array
    return new Array(amountIn ? path.length : 0).fill(amountIn)

    // const pathArray = []
    // const feesArray = []
    // const reversedPath = [...path].reverse()
    // for (let i = 0; i < path.length; i += 2) {
    //   const path0 = reversedPath[i]
    //   const path1 = reversedPath[i + 1]
    //   pathArray.push(
    //     wethAddress && path0 === ETH_ADDRESS ? wethAddress : path0,
    //     wethAddress && path1 === ETH_ADDRESS ? wethAddress : path1,
    //   )
    //   feesArray.push(10000)
    // }
    // const { amountIn } = (await quoter.callStatic.quoteExactOutput(
    //   UniswapV3Router.encodePath(pathArray, feesArray),
    //   amountOutput,
    // )) as {
    //   amountIn: BigNumberish
    // }
    // // v2 returned an array here, so to keep compatibility, we spoof an array
    // return new Array(amountIn ? path.length : 0).fill(amountIn)
  }

  public async getPair<PairType = Contract>(_provider: Provider, _token0: string, _token1: string) {
    return undefined as PairType
  }

  public async getPresetPairs<PairType = LiquidityPairType>(
    provider: Provider,
    tokenAddress: string,
  ): Promise<Array<PairType>> {
    const router = this._getRouterContract(provider)
    const [{ chainId }, factory] = await Promise.all([
      provider.getNetwork(),
      this._getFactoryContract(provider, router),
    ])
    const tokenPresetAddresses = tokenPresets[chainId] ?? []
    const theTokenAddress = tokenAddress === ETH_ADDRESS ? await this._getWethAddress(router) : tokenAddress
    return (
      await Promise.all(
        tokenPresetAddresses
          .filter((otherToken) => theTokenAddress !== otherToken)
          .map(
            (otherToken) =>
              new Promise<Array<PairType>>((resolvePools, rejectPools) => {
                this._findPoolsWithFee(router, factory, theTokenAddress, otherToken)
                  .then((pools) => resolvePools(pools as Array<PairType>))
                  .catch(rejectPools)
              }),
          ),
      )
    ).reduce((acc, value) => [...acc, ...value], [])
  }

  protected async _findPoolsWithFee(
    router: Contract,
    factory: Contract,
    token0Address: string,
    token1Address: string,
    fees: Array<bigint> = [
      BigInt(500), // 0.05%
      BigInt(3000), // 0.3%
      BigInt(10000), // 1%
    ],
  ): Promise<Array<LiquidityPairType>> {
    const { chainId } = await router.provider.getNetwork()
    return (
      await Promise.all(
        fees.map(
          (fee) =>
            new Promise<LiquidityPairType | undefined>((resolve, reject) => {
              this.getPairAddress(router, factory, token0Address, token1Address, fee)
                .then((pairAddress) => {
                  if (!pairAddress || pairAddress === ZERO_ADDRESS) {
                    resolve(undefined)
                  } else {
                    const cached = SwapRouter._pairCache
                      .getState()
                      .getCachedPair(chainId, router.address, token0Address, token1Address, fee)
                    if (cached) {
                      resolve(cached)
                    } else {
                      const liquidityPair: LiquidityPairType = {
                        pairAddress,
                        thisToken: token0Address,
                        otherToken: token1Address,
                        fee,
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
    ).filter((pair) => pair?.pairAddress && pair.pairAddress !== ZERO_ADDRESS) as Array<LiquidityPairType>
  }

  public async findRoutesForSwap(
    provider: Provider,
    fromTokenAddress: string,
    toTokenAddress: string,
  ): Promise<Array<Array<RoutePath>>> {
    const router = this._getRouterContract(provider)
    const containsEth = fromTokenAddress === ETH_ADDRESS || toTokenAddress === ETH_ADDRESS
    const [factory, wethAddress] = await Promise.all([
      this._getFactoryContract(provider, router),
      containsEth ? this._getWethAddress(router) : Promise.resolve(undefined),
    ])
    const token0 = wethAddress && fromTokenAddress === ETH_ADDRESS ? wethAddress : fromTokenAddress
    const token1 = wethAddress && toTokenAddress === ETH_ADDRESS ? wethAddress : toTokenAddress
    const routes: Array<Array<RoutePath>> = []

    const [directRoutes, fromPairs, toPairs] = await Promise.all([
      this._findPoolsWithFee(router, factory, token0, token1),
      this.getPresetPairs(provider, token0),
      this.getPresetPairs(provider, token1),
    ])

    // push direct routes if we found any, then multi-hop routes
    routes.push(
      ...directRoutes.map(({ pairAddress, thisToken, otherToken, fee }) => [
        {
          pairAddress,
          token0: thisToken,
          token1: otherToken,
          fee,
        },
      ]),
      ...fromPairs
        .filter(({ otherToken: fromOtherToken }) =>
          toPairs.some(({ otherToken: toOtherToken }) => fromOtherToken === toOtherToken),
        )
        .map(({ pairAddress, otherToken, fee }) => {
          return [
            { pairAddress, token0: token0, token1: otherToken, fee },
            ...(otherToken !== token1
              ? [
                  {
                    pairAddress:
                      toPairs.find(({ otherToken: otherOtherToken }) => otherOtherToken === otherToken)?.pairAddress ??
                      ZERO_ADDRESS,
                    token0: otherToken,
                    token1: token1,
                    fee,
                  },
                ]
              : []),
          ]
        }),
    )

    return routes
  }
}
