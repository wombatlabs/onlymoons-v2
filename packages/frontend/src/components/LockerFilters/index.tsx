import { FC, useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Root, ViewTypeIcons } from './styles'
import { Button } from '../Button'
import { Colors } from '../../types'
import { persistentStateStorage as storage } from '../../state/persistentStateStorage'
import { Input } from '../Input'
import { utils } from 'ethers'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router'
import { useLocale } from '../../state/stores/locale'
import { RxGrid, RxListBullet } from 'react-icons/rx'

const { isAddress } = utils

export interface ILockerFiltersState {
  /**
   *
   */
  displayAsList: boolean
  /**
   *
   * @param displayAsList {boolean} -
   */
  setDisplayAsList: (displayAsList: boolean) => void
}

export const useLockerFiltersState = create<ILockerFiltersState>()(
  persist(
    (set) => ({
      displayAsList: true,
      setDisplayAsList: (displayAsList) => set({ displayAsList }),
    }),
    {
      name: 'locker-filters-store',
      storage,
    },
  ),
)

export const LockerFilters: FC = () => {
  const { address } = useParams()
  const { getString: s } = useLocale()
  const { displayAsList, setDisplayAsList } = useLockerFiltersState()
  const navigate = useNavigate()
  const [searchHasError, setSearchHasError] = useState<boolean>(false)

  function checkSearchIsValid(value: string) {
    if (isAddress(value)) {
      setSearchHasError(false)
      return true
    } else if (value.length === 0) {
      setSearchHasError(false)
      return false
    } else {
      setSearchHasError(true)
      return false
    }
  }

  useEffect(() => {
    address && checkSearchIsValid(address)
  }, [address])

  return (
    <Root>
      <div className={'grow'}>
        <Input
          size={42}
          className={'w-full lg:w-auto'}
          $color={searchHasError ? Colors.danger : Colors.secondary}
          defaultValue={address}
          placeholder={s('Search by address')}
          onInput={(e) => {
            if (checkSearchIsValid(e.currentTarget.value)) {
              navigate(`/locker/search/${e.currentTarget.value}`)
            } else if (e.currentTarget.value.length === 0) {
              navigate('/locker')
            }
          }}
        />
      </div>

      <ViewTypeIcons>
        <Button
          $size={'md'}
          $color={displayAsList ? Colors.secondary : Colors.ghost}
          onClick={() => setDisplayAsList(true)}
        >
          <RxListBullet />
        </Button>
        <Button
          $size={'md'}
          $color={displayAsList ? Colors.ghost : Colors.secondary}
          onClick={() => setDisplayAsList(false)}
        >
          <RxGrid />
        </Button>
      </ViewTypeIcons>
    </Root>
  )
}
