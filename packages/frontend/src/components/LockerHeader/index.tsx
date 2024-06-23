import { FC } from 'react'
import { LockCountWithOverlay } from '../LockCountWithOverlay'
import { LockerFilters } from '../LockerFilters'
import { LeftSide, LockButtons, PageTitle, RightSide, Root } from './styles'
import { Button } from '../Button'
import { Link } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { useLocale } from '../../state/stores/locale'

export const LockerHeader: FC = () => {
  const { account } = useWeb3React()
  const { getString: s } = useLocale()

  return (
    <Root>
      <LeftSide>
        <PageTitle>{s('Token Locker V1')}</PageTitle>
        <LockCountWithOverlay />
      </LeftSide>

      <RightSide>
        {account && (
          <LockButtons>
            <Link to={'/locker/create'}>
              <Button>{s('Create lock')}</Button>
            </Link>
            <Link to={`/locker/search/${account}`}>
              <Button>{s('Your locks')}</Button>
            </Link>
          </LockButtons>
        )}
        <LockerFilters />
      </RightSide>
    </Root>
  )
}
