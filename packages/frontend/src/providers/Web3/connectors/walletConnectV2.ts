import { initializeConnector } from '@web3-react/core'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'
import { networks } from '@onlymoons-io/networks'

// import { MAINNET_CHAINS } from '../chains'

const MAINNET_CHAINS = {}

const [mainnet, ...optionalChains] = Object.keys(MAINNET_CHAINS).map(Number)

export const [connector, hooks] = initializeConnector<WalletConnectV2>(
  (actions) =>
    new WalletConnectV2({
      actions,
      options: {
        projectId: 'd7c7b2152fe775bd179207995e1560dc', // process.env.walletConnectProjectId,
        chains: [1],
        optionalChains: Object.values(networks)
          .map(({ chainId }) => chainId)
          .filter((chainId) => !!chainId),
        showQrModal: true,
      },
    }),
)
