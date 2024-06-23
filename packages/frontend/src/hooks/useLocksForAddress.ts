import { useEffect, useState } from 'react'
import { TokenLockData } from '../types'
import { useTokenLockerManagerV1Contract } from '../providers/Web3/TokenLockerManagerV1ContractProvider'
import { useLockers } from '../state/stores'

export function useLocksForAddress(
  chainId: number,
  address?: string,
  maxResults?: number,
): Array<TokenLockData> | undefined {
  const managers = useTokenLockerManagerV1Contract()
  const { getLockData: getCachedLockData, setLockData: setCachedLockData } = useLockers()
  const [locks, setLocks] = useState<Array<TokenLockData>>()

  useEffect(() => {
    if (address) {
      const manager = managers[chainId]
      if (manager) {
        manager
          .getTokenLockersForAddress(address)
          .then((lockerIds: Array<number>) => {
            const lockerIdsToUse = maxResults
              ? lockerIds.filter((_, index, arr) => index >= arr.length - maxResults)
              : lockerIds
            return Promise.all(
              lockerIdsToUse.map(async (lockId) => {
                const cached = getCachedLockData(chainId, lockId)
                if (cached) return cached
                const fresh: TokenLockData = await manager.getTokenLockData(lockId)
                if (fresh) {
                  setCachedLockData(chainId, fresh)
                  return fresh
                }
                return null
              }),
            )
          })
          // filters out null results
          .then((results: Array<TokenLockData | null>) => results.filter((result) => !!result))
          .then(setLocks)
          .catch((err: Error) => {
            console.error(err)
            setLocks([])
          })
      } else {
        setLocks([])
      }
    } else {
      setLocks([])
    }
  }, [address, chainId])

  return locks
}
