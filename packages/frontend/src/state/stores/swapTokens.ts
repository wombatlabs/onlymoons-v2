import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { persistentStateStorage as storage } from '../persistentStateStorage'

export interface ISwapTokens {
  tokens: Record<number, Array<string>>
  addToken: (chainId: number, address: string) => void
  removeToken: (chainId: number, address: string) => void
  reset: () => void
}

export const useSwapTokens = create<ISwapTokens>()(
  persist(
    (set) => ({
      tokens: [],
      addToken: (chainId, address) =>
        set(({ tokens }) => ({
          tokens: { ...tokens, [chainId]: [...new Set([...(tokens[chainId] ?? []), address])] },
        })),
      removeToken: (chainId, address) => {
        set(({ tokens }) => ({
          tokens: { ...tokens, [chainId]: tokens[chainId].filter((thisAddress) => thisAddress !== address) },
        }))
      },
      reset: () => set({ tokens: [] }),
    }),
    { name: 'swap-tokens-store', storage },
  ),
)
