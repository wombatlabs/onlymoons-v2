import { FC, ReactNode, useState } from 'react'
import * as Dialog from '../styles'
import { DialogClose } from '../DialogClose'
import { Overlay, WalletTypeList, WalletTypeListItem } from './styles'
import { Connector } from '@web3-react/types'
import { WalletType } from '../../../types'
import { useLocale, useSettings } from '../../../state/stores'
import { useWeb3React } from '@web3-react/core'

export interface ConnectWalletDialogProps {
  readonly trigger: ReactNode
}

export const ConnectWalletDialog: FC<ConnectWalletDialogProps> = ({ trigger }) => {
  const { account, connector, provider } = useWeb3React()
  const { setPreferredWalletType } = useSettings()
  const { getString: s } = useLocale()
  const [connecting, setConnecting] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)

  const connect = async (connector?: Connector, walletType: WalletType = WalletType.None) => {
    if (!connector?.activate) {
      console.log('connector.activate not found')
    } else {
      setConnecting(true)
      try {
        await connector.activate()
        setPreferredWalletType(walletType)
      } catch (e) {
        console.log(e)
      }
    }

    setConnecting(false)
    setOpen(false)
  }

  // @ts-ignore
  // @ts-ignore
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.ContentInner className={'w-screen max-w-72'}>
            <Dialog.Titlebar>
              <Dialog.Title>{account && connector ? s`Account` : s`Connect`}</Dialog.Title>
              <DialogClose />
            </Dialog.Titlebar>
            {/*<Dialog.Description>Connect your wallet.</Dialog.Description>*/}
            <WalletTypeList>
              {account && connector ? (
                <>
                  <WalletTypeListItem
                    onClick={async () => {
                      if (connector.deactivate) {
                        await connector.deactivate()
                      }
                      setPreferredWalletType(WalletType.None)
                      setTimeout(() => {
                        global.location.reload()
                      }, 500)
                    }}
                  >{s`Disconnect`}</WalletTypeListItem>
                </>
              ) : (
                <>
                  <WalletTypeListItem
                    onClick={() =>
                      import('../../../providers/Web3/connectors/metaMask').then(({ connector }) =>
                        connect(connector, WalletType.MetaMask),
                      )
                    }
                  >
                    {s`MetaMask`} &nbsp;<span className={'text-xs'}>({s`+compatible`})</span>
                  </WalletTypeListItem>

                  <WalletTypeListItem
                    onClick={() =>
                      import('../../../providers/Web3/connectors/trustWallet').then(({ connector }) =>
                        connect(connector, WalletType.TrustWallet),
                      )
                    }
                  >
                    {s`Trust Wallet`}
                  </WalletTypeListItem>

                  <WalletTypeListItem
                    onClick={() =>
                      import('../../../providers/Web3/connectors/coinbase').then(({ connector }) =>
                        connect(connector, WalletType.CoinBase),
                      )
                    }
                  >
                    {s`Coinbase`}
                  </WalletTypeListItem>

                  {/* walletconnect v2 is BROKEN, so disable it */}
                  {/*<WalletTypeListItem*/}
                  {/*  onClick={() =>*/}
                  {/*    import('../../../providers/Web3/connectors/walletConnectV2').then(({ connector }) =>*/}
                  {/*      connect(connector, WalletType.WalletConnectV2),*/}
                  {/*    )*/}
                  {/*  }*/}
                  {/*>*/}
                  {/*  {s`WalletConnect V2`}*/}
                  {/*</WalletTypeListItem>*/}

                  {connecting && <Overlay>{s`Connecting...`}</Overlay>}
                </>
              )}
            </WalletTypeList>
          </Dialog.ContentInner>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
