import { networks } from '@onlymoons-io/networks'

export const MAINNET_URLS: Record<number, string[]> = {}
export const TESTNET_URLS: Record<number, string[]> = {}
Object.values(networks).forEach((network) => {
  if (network.isTestNet) {
    TESTNET_URLS[network.chainId] = [network.rpcURL]
  } else {
    MAINNET_URLS[network.chainId] = [network.rpcURL]
  }
})

export enum QueryNetworkType {
  MainNet = 'mainnet',
  TestNet = 'testnet',
  Both = 'all',
}

export function getNetworkUrls(networkType: QueryNetworkType = QueryNetworkType.MainNet) {
  return {
    ...(networkType === QueryNetworkType.MainNet || networkType === QueryNetworkType.Both ? MAINNET_URLS : {}),
    ...(networkType === QueryNetworkType.TestNet || networkType === QueryNetworkType.Both ? TESTNET_URLS : {}),
  }
}
