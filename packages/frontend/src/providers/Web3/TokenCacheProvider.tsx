import { FC, createContext, useContext, ReactNode } from 'react'
import { useUtilContract } from './UtilContractProvider'
import { get as idbGet, set as idbSet, createStore } from 'idb-keyval'
import { ExtendedTokenData } from '../../types'
import { BigNumber } from 'ethers'

const store = createStore('token-cache', 'token-cache-store')

function constructTokenKey(chainId: number, address: string): string {
  return `${chainId}_${address}`
}

export interface TokenCacheItem extends Omit<ExtendedTokenData, 'address' | 'totalSupply' | 'balance'> {
  totalSupply: string
}

export interface ITokenCacheContext {
  /**
   *
   * @param address the address of the token to get data for
   */
  getTokenData: (address: string, chainId: number) => Promise<ExtendedTokenData | undefined>
  /**
   *
   * @param address
   * @param chainId
   */
  getCachedTokenData: (address: string, chainId: number) => Promise<ExtendedTokenData | undefined>
  /**
   *
   * @param tokenData
   * @param chainId
   */
  setCachedTokenData: (tokenData: ExtendedTokenData, chainId: number) => Promise<void>
  /**
   *
   * @param address
   * @param chainId
   */
  getLiveTokenData: (address: string, chainId: number) => Promise<ExtendedTokenData | undefined>
}

export const TokenCacheContext = createContext<ITokenCacheContext>({
  // dummy functions to keep typescript happy
  getTokenData: () => Promise.resolve(undefined),
  getCachedTokenData: () => Promise.resolve(undefined),
  setCachedTokenData: () => Promise.resolve(),
  getLiveTokenData: () => Promise.resolve(undefined),
})

export const useTokenCache = () => useContext(TokenCacheContext)

export interface TokenCacheProviderProps {
  children?: ReactNode
}

export const TokenCacheProvider: FC<TokenCacheProviderProps> = ({ children }) => {
  const utils = useUtilContract()

  async function getCachedTokenData(address: string, chainId: number): Promise<ExtendedTokenData | undefined> {
    const _chainId = parseInt(chainId.toString())
    const chainIdAddress = constructTokenKey(_chainId, address)
    const tokenData = await idbGet<Omit<TokenCacheItem, 'chainIdAddress'>>(chainIdAddress, store)
    if (!tokenData) return undefined
    const { name, symbol, decimals, totalSupply } = tokenData
    return {
      address,
      name,
      symbol,
      decimals,
      totalSupply: BigNumber.from(totalSupply),
      // balance is required on the type, but we don't actually need it.
      balance: BigNumber.from(0),
    }
  }

  async function setCachedTokenData(tokenData: ExtendedTokenData, chainId: number): Promise<void> {
    const { address, name, symbol, decimals, totalSupply } = tokenData
    const _chainId = parseInt(chainId.toString())
    const chainIdAddress = constructTokenKey(_chainId, address)
    const item: Omit<TokenCacheItem, 'chainIdAddress'> = {
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
    }
    await idbSet(chainIdAddress, item, store)
  }

  async function getLiveTokenData(address: string, chainId: number): Promise<ExtendedTokenData | undefined> {
    const _chainId = parseInt(chainId.toString())
    const tokenData = await utils[_chainId].getTokenData(address)
    if (!tokenData) return undefined
    const tokenDataWithAddress = { ...tokenData, address }
    // cache it
    try {
      await setCachedTokenData(tokenDataWithAddress, _chainId)
    } catch (err: unknown) {
      console.log(err instanceof Error ? err.message : err)
    }
    return tokenDataWithAddress
  }

  async function getTokenData(address: string, chainId: number) {
    const _chainId = parseInt(chainId.toString())
    let cachedTokenData: ExtendedTokenData | undefined
    try {
      cachedTokenData = await getCachedTokenData(address, _chainId)
    } catch (err: unknown) {
      console.log(err instanceof Error ? err.message : err)
    }
    if (cachedTokenData) return cachedTokenData
    // cached result didn't exist, so we need to fetch it.
    return await getLiveTokenData(address, chainId)
  }

  return (
    <TokenCacheContext.Provider
      value={{
        getTokenData,
        getCachedTokenData,
        setCachedTokenData,
        getLiveTokenData,
      }}
    >
      {children}
    </TokenCacheContext.Provider>
  )
}
