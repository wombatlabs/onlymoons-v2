import { createContext, FC, ReactNode, useContext, useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'
import { networkConnectors } from './connectors/networkConnectors'
import { getContractByName } from '../../util'
import { useWeb3React } from '@web3-react/core'
import { ExtendedTokenData, LPData } from '../../types'

interface IUtilsContract {
  getTokenData: (address: string) => Promise<ExtendedTokenData | undefined>
  isLpToken: (address: string) => Promise<boolean>
  getLpData: (address: string) => Promise<LPData | undefined>
}

export class UtilsContract extends Contract implements IUtilsContract {
  async getTokenData(address: string): Promise<ExtendedTokenData | undefined> {
    const tokenData = await super.getTokenData(address)
    if (!tokenData) return undefined
    return { address, ...tokenData }
  }

  async isLpToken(address: string): Promise<boolean> {
    return await super.isLpToken(address)
  }

  async getLpData(address: string): Promise<LPData | undefined> {
    try {
      return { address, ...(await super.getLpData(address)) }
    } catch (_err) {
      return undefined
    }
  }
}

export const UtilContractContext = createContext<Record<number, UtilsContract>>({})

export const useUtilContract = () => useContext(UtilContractContext)

export interface UtilContractProviderProps {
  children?: ReactNode
}

export const UtilContractProvider: FC<UtilContractProviderProps> = ({ children }) => {
  // NOTE: the only reason provider is included as a dep in utils memo,
  // is because it triggers a reload after web3 stuff is setup.
  // otherwise, providers from `networkConnectors` are not yet ready
  // and this fails. :(
  const { provider } = useWeb3React()
  const utils = useMemo<Record<number, UtilsContract>>(
    () =>
      Object.values(networkConnectors({ includeTestNets: true })).reduce(
        (acc, [network, _hooks, _store, networkData]) =>
          !network.customProvider
            ? acc
            : {
                ...acc,
                [networkData.chainId]: getContractByName('Util', networkData.chainId, network.customProvider),
              },
        {},
      ),
    [provider],
  )

  return <UtilContractContext.Provider value={utils}>{children}</UtilContractContext.Provider>
}
