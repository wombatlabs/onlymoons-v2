import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { Network } from '@web3-react/network'
import { NetworkData } from '@onlymoons-io/networks'
import { Web3ReactStore } from '@web3-react/types'

export interface GenerateNetworkConnectorOptions {
  network: NetworkData
}

export function generateNetworkConnector({
  network,
}: GenerateNetworkConnectorOptions): [Network, Web3ReactHooks, Web3ReactStore, NetworkData] {
  const { rpcURL, chainId } = network
  const urlMap = { [chainId]: [rpcURL] }

  return [
    ...initializeConnector<Network>((actions) => new Network({ actions, urlMap, defaultChainId: chainId })),
    network,
  ]
}
