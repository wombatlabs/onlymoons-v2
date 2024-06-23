import { TokenData } from '@onlymoons-io/networks'
import { create } from 'zustand'

export interface ISwapState {
  token0?: TokenData
  token1?: TokenData
  amount0?: string
  amount1?: string
  tokenPriority: 0 | 1
  setTokenPriority: (tokenPriority: 0 | 1) => void
  setToken0: (tokenData?: TokenData) => void
  setToken1: (tokenData?: TokenData) => void
  setTokens: (token0Data?: TokenData, token1Data?: TokenData) => void
  setAmount0: (amount?: string) => void
  setAmount1: (amount?: string) => void
  setAmounts: (amount0?: string, amount1?: string) => void
  setTokensAndAmounts: (token0Data?: TokenData, amount0?: string, token1Data?: TokenData, amount1?: string) => void
  reverse: () => void
}

export const useSwapState = create<ISwapState>((set, get) => ({
  tokenPriority: 0,
  setTokenPriority: (tokenPriority) => set({ tokenPriority }),
  setToken0: (token0) => set({ token0 }),
  setToken1: (token1) => set({ token1 }),
  setTokens: (token0, token1) => ({ token0, token1 }),
  setAmount0: (amount0) => set({ amount0 }),
  setAmount1: (amount1) => set({ amount1 }),
  setAmounts: (amount0, amount1) => ({ amount0, amount1 }),
  setTokensAndAmounts: (token0, amount0, token1, amount1) => ({
    token0,
    amount0,
    token1,
    amount1,
  }),
  reverse: () => {
    const {
      //
      token0,
      token1,
      amount0,
      amount1,
      // tokenPriority,
    } = get()
    set({
      token0: token1,
      token1: token0,
      amount0: amount1,
      amount1: amount0,
      // tokenPriority: tokenPriority === 0 ? 1 : 0,
    })
  },
}))
