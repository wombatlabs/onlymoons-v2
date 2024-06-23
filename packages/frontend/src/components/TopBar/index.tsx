import { FC } from 'react'
import { NavMenu } from '../NavMenu'
import { AccountDetails, Root } from './styles'
import { AccountButton } from '../AccountButton'
import { NetworkStatus } from '../NetworkStatus'

export const TopBar: FC = () => {
  return (
    <Root>
      <NavMenu />
      <AccountDetails>
        <NetworkStatus />
        <AccountButton />
      </AccountDetails>
    </Root>
  )
}
