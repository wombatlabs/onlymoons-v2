import { FC } from 'react'
import { useParams } from 'react-router'
import { useLocksForAddress } from '../../../hooks/useLocksForAddress'
import { networkConnectors } from '../../../providers/Web3/connectors/networkConnectors'
import { ExtendedTokenLockData } from '../../../types'
import { sortLockDataArray } from '../../../util'
import { useSettings } from '../../../state/stores'
import { PaginatedLocks } from '../../../components/PaginatedLocks'
import { LockerHeader } from '../../../components/LockerHeader'
import { useLockerFiltersState } from '../../../components/LockerFilters'

const MAX_LOCKS = 100

const LockerSearchAddressPage: FC = () => {
  const { address } = useParams()
  const { includeTestNets } = useSettings()
  const locks = networkConnectors({ includeTestNets })
    .map(
      ([_1, _2, _3, { chainId: networkChainId }]) =>
        useLocksForAddress(networkChainId, address, MAX_LOCKS)?.map(
          (thisLockData) =>
            ({
              ...thisLockData,
              chainId: networkChainId,
            }) as ExtendedTokenLockData,
        ) ?? [],
    )
    .reduce((acc, value) => [...acc, ...value], [])
    .sort(sortLockDataArray)
    .filter((_, index) => index < MAX_LOCKS)
  const { displayAsList } = useLockerFiltersState()

  return (
    <div className={'p-4'}>
      <LockerHeader />
      <PaginatedLocks locks={locks} displayAsList={displayAsList} />
    </div>
  )
}

export default LockerSearchAddressPage
