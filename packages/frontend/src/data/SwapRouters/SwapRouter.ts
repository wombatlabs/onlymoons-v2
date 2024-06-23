import { Provider, TransactionReceipt } from '@ethersproject/providers'
import { Signer } from 'ethers'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import PQueue from 'p-queue'
import { ETH_ADDRESS, ZERO_ADDRESS } from '../../constants'
import { ISwapPairCache, useSwapPairCache } from '../../state/stores/swapPairCache'
import { getContractByAddress } from '../../util'

// global queue.
const queue = new PQueue({
  concurrency: 50,
  carryoverConcurrencyCount: true,
  timeout: 5000,
  throwOnTimeout: false,
  autoStart: true,
  interval: 1000,
  intervalCap: 50,
})

export type RoutePath = { pairAddress: string; token0: string; token1: string; fee: bigint }
export type LiquidityPairType = { pairAddress: string; thisToken: string; otherToken: string; fee: bigint }
export type QuoteResult = { amount: bigint; impact: number }

export interface ISwapPairCacheIntermediate {
  getState: () => ISwapPairCache
}

export interface SwapRouterSwapOptions {
  provider: Signer
  path: Array<RoutePath>
  priority: 0 | 1
  amountInput: bigint
  minimumReceived: bigint
  deadline: bigint
  spoof?: boolean
  onReceipt?: (result: { response: unknown; receipt?: TransactionReceipt }) => void
}

export interface SwapRouterDetectSlippageOptions extends Omit<SwapRouterSwapOptions, 'spoof'> {
  minSlippage?: number
  maxSlippage?: number
}

export interface SwapRouterOptions {
  /** human readable name */
  name: string
  /** this should match `dexId` from dexscreener */
  code: string
  /** address of the router contract. */
  routerAddress: string
  /** allows overriding router ABI - in case function names are different */
  routerAbi: ContractInterface
  /** allows overriding factory ABI - in case function names are different */
  factoryAbi: ContractInterface
  /** allows overriding pair/pool ABI - in case function names are different */
  pairAbi: ContractInterface
  /** useful for v2 dexes since they use a constant fee for all LP pairs */
  feeConstant?: bigint | number | string
}

export abstract class SwapRouter {
  protected constructor({ name, code, routerAddress, routerAbi, factoryAbi, pairAbi, feeConstant }: SwapRouterOptions) {
    this.name = name
    this.code = code
    this._routerAddress = routerAddress
    this._routerAbi = routerAbi
    this._factoryAbi = factoryAbi
    this._pairAbi = pairAbi
    this._feeConstant = feeConstant ? BigInt(feeConstant) : undefined
  }

  /** human readable name */
  public readonly name: string
  /** this should match `dexId` from dexscreener */
  public readonly code: string
  /** useful for v2 dexes since they use a constant fee for all LP pairs */
  protected readonly _feeConstant?: bigint
  /** address of the router contract. */
  protected readonly _routerAddress: string
  protected readonly _routerAbi: ContractInterface
  protected readonly _factoryAbi: ContractInterface
  protected readonly _pairAbi: ContractInterface
  protected _wethAddress?: string
  protected static readonly _requestQueue: PQueue = queue
  protected static readonly _pairCache: ISwapPairCacheIntermediate = useSwapPairCache

  protected static pathContainsEth(path: Array<RoutePath>): boolean {
    return path.some(({ token0, token1 }) => token0 === ETH_ADDRESS || token1 === ETH_ADDRESS)
  }

  protected static isWrapOrUnwrap(path: Array<RoutePath>, wethAddress?: string): boolean {
    if (path.length !== 2) return false
    if (!wethAddress) return false
    switch (true) {
      case path[0].token0 === ETH_ADDRESS:
      case path[0].token0 === wethAddress:
        switch (true) {
          case path[1].token1 === ETH_ADDRESS:
          case path[1].token1 === wethAddress:
            return true
          default:
            return false
        }
      default:
        return false
    }
  }

  protected getRouterContract(provider: Signer | Provider) {
    return getContractByAddress(this._routerAddress, this._routerAbi, provider)
  }

  protected async getFactoryContract(provider: Signer | Provider, router: Contract) {
    return getContractByAddress(await SwapRouter._requestQueue.add(() => router.factory()), this._factoryAbi, provider)
  }

  protected _getPairContract(provider: Signer | Provider, pairAddress: string) {
    return getContractByAddress(pairAddress, this._pairAbi, provider)
  }

  public static resetQueue() {
    SwapRouter._requestQueue.clear()
  }

  public abstract getApprovalAddress(): string
  public abstract getPairAddress(
    router: Contract,
    factory: Contract,
    token0: string,
    token1: string,
    fee?: bigint,
  ): Promise<string | undefined>
  protected abstract _getWethAddress(router: Contract): Promise<string>
  public abstract swap(options: SwapRouterSwapOptions): Promise<Array<bigint> | undefined>
  public abstract detectSlippage(options: SwapRouterDetectSlippageOptions): Promise<number>
  public abstract getPriceImpacts(
    provider: Provider,
    path: Array<RoutePath>,
    amountInput: bigint,
    outputAmounts: Array<bigint>,
  ): Promise<{ total: number; impacts: Array<number> }>
  public abstract quoteOut(
    provider: Signer | Provider,
    amountInput: bigint,
    path: Array<RoutePath>,
  ): Promise<Array<QuoteResult>>
  public abstract quoteIn(
    provider: Signer | Provider,
    amountOutput: bigint,
    path: Array<RoutePath>,
  ): Promise<Array<QuoteResult>>
  public async getPair<PairType = Contract>(provider: Provider, token0: string, token1: string) {
    const router = this.getRouterContract(provider)
    const factory = await this.getFactoryContract(provider, router)
    const pairAddress = await this.getPairAddress(router, factory, token0, token1)
    return pairAddress ? (this._getPairContract(provider, pairAddress) as PairType) : undefined
  }
  public abstract getPresetPairs<PairType extends LiquidityPairType = LiquidityPairType>(
    provider: Provider,
    tokenAddress: string,
  ): Promise<Array<PairType>>
  public async findRoutesForSwap(
    provider: Provider,
    fromTokenAddress: string,
    toTokenAddress: string,
  ): Promise<Array<Array<RoutePath>>> {
    const router = this.getRouterContract(provider)
    // const factory = await this.getFactoryContract(provider, router)
    const containsEth = fromTokenAddress === ETH_ADDRESS || toTokenAddress === ETH_ADDRESS
    const wethAddress = containsEth ? await this._getWethAddress(router) : undefined
    const token0 = wethAddress && fromTokenAddress === ETH_ADDRESS ? wethAddress : fromTokenAddress
    const token1 = wethAddress && toTokenAddress === ETH_ADDRESS ? wethAddress : toTokenAddress

    const [directPair, fromPairs, toPairs] = await Promise.all([
      this.getPair(provider, token0, token1)
        .then(async (pairContract) => {
          if (!pairContract) return undefined
          const lp: LiquidityPairType = {
            pairAddress: pairContract.address,
            thisToken: token0,
            otherToken: token1,
            fee: this._feeConstant ?? (await pairContract.fee()),
          }
          return lp
        })
        .catch((err) => {
          console.log(err)
        }),
      this.getPresetPairs(provider, token0),
      this.getPresetPairs(provider, token1),
    ])

    const fromNestedPairs = (
      await Promise.all(fromPairs.map(({ otherToken }) => this.getPresetPairs(provider, otherToken)))
    ).reduce((acc, value) => [...acc, ...value], [])

    return [
      ...(directPair && directPair.pairAddress !== ZERO_ADDRESS
        ? [[{ pairAddress: directPair.pairAddress, token0, token1, fee: directPair.fee }]]
        : []),
      ...fromPairs
        .filter(({ pairAddress }) => pairAddress !== ZERO_ADDRESS)
        // .filter(({ otherToken: fromOtherToken }) =>
        //   toPairs.some(({ otherToken: toOtherToken }) => fromOtherToken === toOtherToken),
        // )
        .map(({ pairAddress, otherToken, fee }) => {
          const thisRoute: RoutePath = { pairAddress, token0: token0, token1: otherToken, fee }
          const singleHopPairs = toPairs.filter(({ otherToken: otherOtherToken }) => otherOtherToken === otherToken)
          const secondHopPairs = fromNestedPairs.reduce<
            Array<[fromNestedPair: LiquidityPairType, toPair: LiquidityPairType]>
          >((acc, fromNestedPair) => {
            const fromPair = fromPairs.find((fromPair) => fromNestedPair.thisToken === fromPair.otherToken)
            const toPair = toPairs.find((toPair) => toPair.otherToken === fromNestedPair.otherToken)
            if (fromPair && toPair) {
              return [...acc, [fromNestedPair, toPair]]
            } else {
              return [...acc]
            }
          }, [])
          return [
            ...singleHopPairs.map((singleHopPair) => [
              thisRoute,
              {
                pairAddress: singleHopPair.pairAddress,
                token0: singleHopPair.otherToken,
                token1: singleHopPair.thisToken,
                fee,
              },
            ]),
            ...secondHopPairs.map(([fromNestedPair, toPair]) => [
              thisRoute,
              {
                pairAddress: fromNestedPair.pairAddress,
                token0: fromNestedPair.thisToken,
                token1: fromNestedPair.otherToken,
                fee: fromNestedPair.fee,
              },
              {
                pairAddress: toPair.pairAddress,
                token0: toPair.otherToken,
                token1: toPair.thisToken,
                fee: toPair.fee,
              },
            ]),
          ]
        })
        .reduce((acc, value) => [...acc, ...value], []),
    ]
  }
}
