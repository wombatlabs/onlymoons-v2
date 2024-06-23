import { createContext, FC, ReactNode, useContext, useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'
import { networkConnectors } from './connectors/networkConnectors'
import { getContractByName } from '../../util'

export const TokenLockerManagerV1ContractContext = createContext<Record<number, Contract>>({})

export const useTokenLockerManagerV1Contract = () => useContext(TokenLockerManagerV1ContractContext)

export interface TokenLockerManagerV1ContractProviderProps {
  children?: ReactNode
}

export const TokenLockerManagerV1ContractProvider: FC<TokenLockerManagerV1ContractProviderProps> = ({ children }) => {
  // this might need to be `useState` instead of `useRef` so it re-renders on network changes?
  const managers = useMemo<Record<number, Contract>>(
    () =>
      Object.values(networkConnectors({ includeTestNets: true })).reduce(
        (acc, [network, _hooks, _store, networkData]) =>
          !network.customProvider
            ? acc
            : {
                ...acc,
                [networkData.chainId]: getContractByName(
                  'TokenLockerManagerV1',
                  networkData.chainId,
                  network.customProvider,
                ),
              },
        {},
      ),
    [],
  )

  return (
    <TokenLockerManagerV1ContractContext.Provider value={managers}>
      {Object.keys(managers).length === 0 ? <>No managers... :(</> : children}
    </TokenLockerManagerV1ContractContext.Provider>
  )
}
