import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { persistentStateStorage as storage } from '../persistentStateStorage'
import { LiquidityPairType } from '../../data/SwapRouters'

export interface ISwapPairCache {
  /** chainId -> routerAddress -> token0 -> token1 -> fee (bigint as string) = LiquidityPairType */
  pairs: Record<
    number,
    Record<string, Record<string, Record<string, Record<string, Omit<LiquidityPairType, 'fee'> & { fee: string }>>>>
  >
  getCachedPair: (
    chainId: number,
    routerAddress: string,
    token0: string,
    token1: string,
    fee: bigint,
  ) => LiquidityPairType | undefined
  setCachedPair: (chainId: number, routerAddress: string, pair: LiquidityPairType) => void
}

export const useSwapPairCache = create<ISwapPairCache>()(
  persist(
    (set, get) => ({
      pairs: {},
      getCachedPair: (chainId, routerAddress, token0, token1, fee) => {
        const { pairs } = get()
        if (!pairs[chainId]) return undefined
        if (!pairs[chainId][routerAddress]) return undefined
        if (!pairs[chainId][routerAddress][token0]) return undefined
        if (!pairs[chainId][routerAddress][token0][token1]) return undefined
        const feeString = fee.toString()
        const pair = pairs[chainId][routerAddress][token0][token1][feeString]
        return pair ? { ...pair, fee: BigInt(pair.fee) } : undefined
      },
      setCachedPair: (chainId, routerAddress, { fee, ...pair }) =>
        set(({ pairs }) => ({
          // this is madness but it should work
          pairs: {
            ...pairs,
            [chainId]: {
              ...(pairs[chainId] ?? {}),
              [routerAddress]: {
                ...((pairs[chainId] ?? {})[routerAddress] ?? {}),
                [pair.thisToken]: {
                  ...(((pairs[chainId] ?? {})[routerAddress] ?? {})[pair.thisToken] ?? {}),
                  [pair.otherToken]: {
                    ...((((pairs[chainId] ?? {})[routerAddress] ?? {})[pair.thisToken] ?? {})[pair.otherToken] ?? {}),
                    [fee.toString()]: { ...pair, fee: fee.toString() },
                  },
                },
              },
            },
          },
        })),
    }),
    { name: 'swap-pair-cache', storage },
  ),
)
