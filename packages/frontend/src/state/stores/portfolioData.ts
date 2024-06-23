import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { persistentStateStorage as storage } from '../../state/persistentStateStorage'
import { BigNumber } from 'ethers'

export function constructTokenKey(address: string, chainId: number): string {
  return `${chainId}_${address}`
}

export interface IPortfolioData {
  /** chainIdAddress -> balance */
  balances: Record<string, string>
  /**
   *
   * @param address
   * @param chainId
   * @param balance
   */
  setBalance: (address: string, chainId: number, balance: BigNumber) => void
  /**
   *
   * @param address
   * @param chainId
   */
  getBalance: (address: string, chainId: number) => BigNumber | undefined
  /** blocked tokens */
  blocked: Array<string>
  /**
   *
   * @param address
   * @param chainId
   * @param blocked
   */
  blockToken: (address: string, chainId: number, blocked?: boolean) => void
  /**
   *
   * @param address
   * @param chainId
   */
  isBlocked: (address: string, chainId: number) => boolean
}

export const usePortfolioData = create<IPortfolioData>()(
  persist(
    (set, get) => ({
      balances: {},
      setBalance: (address, chainId, balance) =>
        set(({ balances }) => ({
          balances: {
            ...balances,
            [constructTokenKey(address, chainId)]: balance.toString(),
          },
        })),
      getBalance: (address, chainId) => {
        const { balances } = get()
        const key = constructTokenKey(address, chainId)
        const balance = balances[key]
        return balance ? BigNumber.from(balance) : undefined
      },
      blocked: [],
      blockToken: (address, chainId, blocked = true) => {
        const key = constructTokenKey(address, chainId)
        if (blocked) {
          set(({ balances, blocked }) => ({
            balances: (() => {
              delete balances[key]
              return balances
            })(),
            blocked: (() => {
              if (!blocked.includes(key)) blocked.push(key)
              return blocked
            })(),
          }))
        } else {
          set(({ blocked }) => ({
            blocked: blocked.filter((item) => item !== key),
          }))
        }
      },
      isBlocked: (address, chainId) => {
        const key = constructTokenKey(address, chainId)
        const { blocked } = get()
        return blocked.includes(key)
      },
    }),
    {
      name: 'portfolio-data',
      storage,
    },
  ),
)
