import { FC, createContext, useContext, ReactNode, useCallback } from 'react'
import { useUtilContract } from './UtilContractProvider'
import { get as idbGet, set as idbSet, createStore } from 'idb-keyval'
import { LPData } from '../../types'
import { BigNumber } from 'ethers'
import { ERC20, UniswapV2Pair } from '../../contracts/external_contracts.json'
import { getContractByAddress } from '../../util'
import { networkConnectors } from './connectors/networkConnectors'

const { abi: ERC20ABI } = ERC20
const { abi: uniswapV2PairABI } = UniswapV2Pair

const store = createStore('lp-cache', 'lp-cache-store')

function constructTokenKey(chainId: number, address: string): string {
  return `${chainId}_${address}`
}

interface LPCacheItem extends Omit<LPData, 'address' | 'balance0' | 'balance1' | 'price0' | 'price1'> {
  balance0: string
  balance1: string
}

export interface ILPCacheContext {
  /**
   *
   * @param address the address of the lp token to get data for
   */
  getLpData: (address: string, chainId: number) => Promise<LPData | undefined>
  /**
   *
   * @param chainId
   * @param address
   */
  getCachedLpData: (chainId: number, address: string) => Promise<LPData | undefined>
  /**
   *
   * @param lpData
   * @param chainId
   */
  setCachedLpData: (lpData: LPData, chainId: number) => Promise<void>
  /**
   *
   * @param chainId
   * @param address
   */
  getLiveLpData: (chainId: number, address: string) => Promise<LPData | undefined>
}

export const LPCacheContext = createContext<ILPCacheContext>({
  // dummy functions to keep typescript happy
  getLpData: async () => undefined,
  getCachedLpData: async () => undefined,
  setCachedLpData: async () => {},
  getLiveLpData: async () => undefined,
})

export const useLPCache = () => useContext(LPCacheContext)

export interface LPCacheProviderProps {
  children?: ReactNode
}

export const LPCacheProvider: FC<LPCacheProviderProps> = ({ children }) => {
  const utils = useUtilContract()

  const getCachedLpData = useCallback(async (chainId: number, address: string): Promise<LPData | undefined> => {
    const _chainId = parseInt(chainId.toString())
    const lpData = await idbGet<LPCacheItem>(constructTokenKey(_chainId, address), store)
    if (!lpData) return undefined
    const { balance0, balance1, ...restOfLpData } = lpData
    return {
      ...restOfLpData,
      address,
      balance0: BigNumber.from(balance0),
      balance1: BigNumber.from(balance1),
      price0: BigNumber.from(0),
      price1: BigNumber.from(0),
    }
  }, [])

  const setCachedLpData = useCallback(
    async ({ address, token0, token1, balance0, balance1 }: LPData, chainId: number): Promise<void> => {
      const _chainId = parseInt(chainId.toString())
      const chainIdAddress = constructTokenKey(_chainId, address)
      const lpData: LPCacheItem = {
        token0,
        token1,
        balance0: balance0.toString(),
        balance1: balance1.toString(),
      }
      await idbSet(chainIdAddress, lpData, store)
    },
    [],
  )

  const getLiveLpData = useCallback(
    async (chainId: number, address: string): Promise<LPData | undefined> => {
      const _chainId = parseInt(chainId.toString())
      let lpData: LPData | undefined = undefined
      try {
        lpData = await utils[_chainId].getLpData(address)
      } catch (err) {
        console.log(err)
      }
      if (!lpData) {
        const [[{ customProvider }]] = networkConnectors().filter(
          ([_1, _2, _3, { chainId: thisChainId }]) => _chainId === thisChainId,
        )
        if (!customProvider) throw new Error('NO_PROVIDER')
        const pairContract = getContractByAddress(address, uniswapV2PairABI, customProvider)
        const [token0, token1] = await Promise.all([pairContract.token0(), pairContract.token1()])
        const contract0 = getContractByAddress(token0, ERC20ABI, customProvider)
        const contract1 = getContractByAddress(token1, ERC20ABI, customProvider)
        const [balance0, balance1] = await Promise.all([contract0.balanceOf(address), contract1.balanceOf(address)])
        lpData = {
          address,
          token0,
          token1,
          balance0,
          balance1,
          price0: BigNumber.from(0),
          price1: BigNumber.from(0),
        }
      }
      if (!lpData) return undefined
      const lpDataWithAddress = { ...lpData, address }
      // cache it
      try {
        await setCachedLpData(lpDataWithAddress, _chainId)
      } catch (err: unknown) {
        console.log(err instanceof Error ? err.message : err)
      }
      return lpDataWithAddress
    },
    [utils, setCachedLpData],
  )

  const getLpData = useCallback(
    async (address: string, chainId: number): Promise<LPData | undefined> => {
      const _chainId = parseInt(chainId.toString())
      let cachedLpData: LPData | undefined
      try {
        cachedLpData = await getCachedLpData(_chainId, address)
      } catch (err: unknown) {
        console.log(err instanceof Error ? err.message : err)
      }
      return cachedLpData ?? (await getLiveLpData(_chainId, address))
    },
    [getLiveLpData, getCachedLpData],
  )

  return (
    <LPCacheContext.Provider
      value={{
        getLpData,
        getCachedLpData,
        setCachedLpData,
        getLiveLpData,
      }}
    >
      {children}
    </LPCacheContext.Provider>
  )
}
