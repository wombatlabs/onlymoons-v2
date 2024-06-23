import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ExtendedTokenLockData, TokenLockData } from '../../types'
import { constructLockerKey, extendedTokenLockDataToTokenLockData } from '../../util'
import { persistentStateStorage as storage } from '../persistentStateStorage'

export interface ILockers {
  counts: Record<number, number>
  setCount: (chainId: number, count: number) => void
  getCount: (chainId: number) => number
  getTotalCount: () => number
  lastLoadedIds: Record<number, number>
  setLastLoadedId: (chainId: number, lockId: number) => void
  getLastLoadedId: (chainId: number) => number
  locks: Record<string, ExtendedTokenLockData>
  setLockData: (chainId: number, lockData: TokenLockData) => void
  getLockData: (chainId: number, lockId: number) => TokenLockData | null
  resetLockData: () => void
}

export const useLockers = create<ILockers>()(
  persist(
    (set, get) => ({
      counts: {},
      setCount: (chainId, count) => {
        set(({ counts }) => ({ counts: { ...counts, [chainId]: count } }))
      },
      getCount: (chainId) => {
        const { counts } = get()
        return counts[chainId] ?? -1
      },
      getTotalCount: () => {
        const { counts } = get()
        return Object.values(counts).reduce((acc, value) => acc + value, 0)
      },
      lastLoadedIds: {},
      setLastLoadedId: (chainId, lockId) => {
        set(({ lastLoadedIds }) => ({
          lastLoadedIds: {
            ...lastLoadedIds,
            [chainId]: lockId,
          },
        }))
      },
      getLastLoadedId: (chainId) => {
        const { lastLoadedIds } = get()
        return lastLoadedIds[chainId] ?? -1
      },
      locks: {},
      setLockData: (chainId, lockData) => {
        set(({ locks }) => ({
          locks: {
            ...locks,
            [constructLockerKey(chainId, lockData.id)]: { ...lockData, chainId },
          },
        }))
      },
      getLockData: (chainId, lockId) => {
        const { locks } = get()
        return extendedTokenLockDataToTokenLockData(locks[constructLockerKey(chainId, lockId)])
      },
      resetLockData: () => {
        set({ locks: {}, lastLoadedIds: {}, counts: {} })
      },
    }),
    {
      name: 'locker-storage',
      storage,
    },
  ),
)
