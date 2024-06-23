import { forwardRef, HTMLAttributes } from 'react'
import { Root } from './styles'
import { Button } from '../Button'
import { Colors } from '../../types'
import { ConnectWalletDialog } from '../Dialog/ConnectWalletDialog'
import { useWeb3React } from '@web3-react/core'
import { getShortAddress } from '../../util'
import { useLocale, useSettings } from '../../state/stores'

export const AccountButton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const { account } = useWeb3React()
  const { hideAccountAddress } = useSettings()
  const { getString: s } = useLocale()

  return (
    <Root ref={ref} {...props}>
      <ConnectWalletDialog
        trigger={
          <Button $color={Colors.transparent}>
            {hideAccountAddress
              ? getShortAddress('0x0000000000000000000000000000000000000000')
              : account
                ? getShortAddress(account)
                : s('Connect')}
          </Button>
        }
      />
    </Root>
  )
})
