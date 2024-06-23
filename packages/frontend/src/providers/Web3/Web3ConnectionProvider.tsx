import { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { WalletType } from '../../types'
import { Connector } from '@web3-react/types'
import { networkConnectors } from './connectors/networkConnectors'
import { useSettings } from '../../state/stores'

export interface Web3AccountProviderProps {
  readonly children?: ReactNode
}

export const Web3ConnectionProvider: FC<Web3AccountProviderProps> = ({ children }) => {
  const { includeTestNets, preferredWalletType } = useSettings()
  const defaultConnectors = useRef<[Connector, Web3ReactHooks][]>(
    networkConnectors({ includeTestNets }).map(([connector, hooks]) => [connector, hooks]),
  )
  const [accountConnector, setAccountConnector] = useState<[Connector, Web3ReactHooks, WalletType]>()
  const [{ connectors, key }, setConnectors] = useState<{ key: WalletType; connectors: [Connector, Web3ReactHooks][] }>(
    {
      key: WalletType.None,
      connectors: defaultConnectors.current,
    },
  )

  useEffect(() => {
    networkConnectors({ includeTestNets }).forEach(([connector]) => {
      void connector.activate().catch(() => {
        console.log(`Failed to activate Network`)
      })
    })
  }, [])

  useEffect(() => {
    switch (preferredWalletType) {
      case WalletType.MetaMask:
        import('./connectors/metaMask').then(({ connector, hooks }) => {
          setAccountConnector([connector, hooks, WalletType.MetaMask])
        })
        break
      case WalletType.TrustWallet:
        import('./connectors/trustWallet').then(({ connector, hooks }) => {
          setAccountConnector([connector, hooks, WalletType.TrustWallet])
        })
        break
      case WalletType.CoinBase:
        import('./connectors/coinbase').then(({ connector, hooks }) => {
          setAccountConnector([connector, hooks, WalletType.CoinBase])
        })
        break
      // walletconnect v2 is broken. great. awesome.
      // case WalletType.WalletConnectV2:
      //   import('./connectors/walletConnectV2').then(({ connector, hooks }) => {
      //     setAccountConnector([connector, hooks, WalletType.WalletConnectV2])
      //   })
      //   break
    }
  }, [preferredWalletType])

  useEffect(() => {
    const [connector, hooks, type] = accountConnector ?? []
    setConnectors(() => ({
      connectors:
        connector && typeof hooks !== 'undefined'
          ? [[connector, hooks], ...defaultConnectors.current]
          : defaultConnectors.current,
      key: type ?? WalletType.None,
    }))
  }, [accountConnector])

  useEffect(() => {
    if (accountConnector && preferredWalletType !== WalletType.None) {
      const [connector] = accountConnector
      connector.connectEagerly &&
        void connector
          .connectEagerly()
          ?.then(() => {
            console.log('Wallet connected')
          })
          .catch(() => {
            console.log('Failed to connect wallet')
          })
    }
  }, [accountConnector, preferredWalletType])

  return (
    <Web3ReactProvider key={key} connectors={connectors}>
      {children}
    </Web3ReactProvider>
  )
}
