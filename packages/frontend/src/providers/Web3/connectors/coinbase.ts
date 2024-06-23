import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector } from '@web3-react/core'
import { networks } from '@onlymoons-io/networks'

const urls: Record<number, string[]> = Object.values(networks).reduce((acc, network) => {
  return { ...acc, [network.chainId]: [network.rpcURL] }
}, {})

export const [connector, hooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: urls[1][0],
        appName: 'onlymoons.io',
      },
    }),
)
