import { FC, useMemo } from 'react'
import { useParams } from 'react-router'
import { getNetworkDataByUrlName, NetworkData } from '@onlymoons-io/networks'
import { LockDetailsFull } from '../../../components/LockDetailsFull'

const LockerNetworkId: FC = () => {
  const { network, id: lockIdString } = useParams<{ network: string; id: string }>()
  const lockId = lockIdString ? parseInt(lockIdString) : undefined
  const { chainId } = useMemo<Partial<NetworkData>>(
    () =>
      network ? getNetworkDataByUrlName(network) ?? ({} as unknown as NetworkData) : ({} as unknown as NetworkData),
    [network],
  )

  return chainId && typeof lockId === 'number' ? (
    <LockDetailsFull chainId={chainId} lockId={lockId} />
  ) : (
    <>Loading lock data...</>
  )
}

export default LockerNetworkId
