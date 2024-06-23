import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { networkConnectors } from '../../providers/Web3/connectors/networkConnectors'
import { useLockers, useSettings } from '../../state/stores'
import { useTokenLockerManagerV1Contract } from '../../providers/Web3/TokenLockerManagerV1ContractProvider'
import { isAtBottom, sortLockDataArray } from '../../util'
import { PaginatedLocks } from '../../components/PaginatedLocks'
import { useLockerFiltersState } from '../../components/LockerFilters'
import { LockerHeader } from '../../components/LockerHeader'

/**
 * number of locks to load at once.
 * NOTE: keep at 1 for now, because i'm not
 * convinced that anything above 1 is safe.
 * values over 1 may result in dupe requests?
 */
const NUM_LOCKS_TO_LOAD = 1

/**
 * main locker view
 */
const LockerPage: FC = () => {
  const { includeTestNets, realtimeUpdates } = useSettings()
  const { locks, setLockData, setLastLoadedId, getLastLoadedId, counts, setCount, getCount } = useLockers()
  const [maxLocksToDisplay, setMaxLocksToDisplay] = useState<number>(5)
  const managers = useTokenLockerManagerV1Contract()
  const lastLoadedCreatedAt = useRef<Record<number, number>>(
    Object.values(networkConnectors({ includeTestNets })).reduce(
      (acc, [_connector, _hooks, _state, networkData]) => ({ ...acc, [networkData.chainId]: -1 }),
      {},
    ),
  )
  const [{ lastActivityAt, timer }, setLockDataTimer] = useState<{ lastActivityAt: number; timer?: NodeJS.Timeout }>({
    lastActivityAt: Date.now(),
  })
  const [loadingLocks, setLoadingLocks] = useState<boolean>(false)
  const lockDataArray = useMemo(
    () =>
      Object.values(locks)
        .sort(sortLockDataArray)
        .filter((_v, index) => index < maxLocksToDisplay),
    [locks, maxLocksToDisplay],
  )
  const isUpdating = useRef<Record<number, boolean>>({})
  const needsAnotherUpdate = useRef<Record<number, boolean>>({})
  const { displayAsList } = useLockerFiltersState()

  const updateNetwork = async (chainId: number) => {
    if (isUpdating.current[chainId]) {
      needsAnotherUpdate.current[chainId] = true
      return
    }

    isUpdating.current[chainId] = true

    const updateLock = async () => {
      if (getLastLoadedId(chainId) === 0) return
      const lastLoadedId = Math.max(getLastLoadedId(chainId) - 1, 0)
      setLastLoadedId(chainId, lastLoadedId)
      const thisLockData = await managers[chainId].getTokenLockData(lastLoadedId)
      lastLoadedCreatedAt.current[chainId] = thisLockData.createdAt
      setLockData(chainId, thisLockData)
    }

    try {
      await Promise.all(new Array(NUM_LOCKS_TO_LOAD).fill(null).map(() => updateLock()))
    } catch (err) {
      console.log(err)
    }

    isUpdating.current[chainId] = false

    if (needsAnotherUpdate.current[chainId]) {
      needsAnotherUpdate.current[chainId] = false
      await updateNetwork(chainId)
    }
  }

  useEffect(() => {
    const [lastLock] = lockDataArray.slice(-1)
    const chainIds = [...new Set(lockDataArray.map(({ chainId }) => chainId))]

    // should we keep updating?
    chainIds.forEach((chainId) => {
      if (getLastLoadedId(chainId) === 0) {
        // console.log(`we're at the end of ${chainId}!`)
      } else if (!lastLock) {
        // console.log('lastLock is undefined!')
      } else if (lastLoadedCreatedAt.current[chainId] > lastLock.createdAt) {
        updateNetwork(chainId).catch((err) => {
          console.log(err)
        })
      }
    })
  }, [lockDataArray])

  const updateLockData = useCallback(async () => {
    // signal that we're now loading
    setLoadingLocks(true)
    // do some stuff
    await Promise.all(
      Object.keys(counts)
        .map((chainId) => chainId as unknown as keyof typeof counts)
        .map((chainId) => updateNetwork(chainId)),
    )
    // signal that we're done loading
    setLoadingLocks(false)
  }, [counts])

  /**
   * updates count for network specified by `chainId`
   *
   * TODO: move out of this file
   */
  const updateCount = useCallback(async (chainId: number) => {
    // reference token locker manager for this network
    const manager = managers[chainId]
    // ensure that the manager contract is valid
    if (!manager) throw new Error(`Could not update count for invalid network: ${chainId}`)
    // get the current token locker count
    const count = await manager.tokenLockerCount()
    // store previous count so we can tell if it changed
    const previousCount = getCount(chainId)
    // set the new count
    setCount(chainId, count)
    // get the last loaded id for this network
    const lastLoadedId = getLastLoadedId(chainId)
    // if count has changed, we should reset so new locks are loaded.
    // otherwise, we should track last loaded id of the network
    setLastLoadedId(chainId, lastLoadedId > 0 && previousCount === count ? Math.min(count, lastLoadedId) : count)
  }, [])

  /**
   * updates counts for all networks
   *
   * TODO: move out of this file
   */
  const updateCounts = useCallback(async () => {
    await Promise.all(
      networkConnectors({ includeTestNets }).map(([_network, _hooks, _store, { chainId }]) => updateCount(chainId)),
    )
  }, [])

  // executes `updateCounts` whenever it updates, which currently is only on mount
  useEffect(() => {
    updateCounts().catch(console.error)
  }, [updateCounts])

  const lastFocusUpdate = useRef<number>(0)

  useEffect(() => {
    const listener = async () => {
      if (Date.now() - lastFocusUpdate.current >= 10000) {
        await updateCounts()
        lastFocusUpdate.current = Date.now()
      }
    }

    globalThis.addEventListener('focus', listener)

    return () => {
      globalThis.removeEventListener('focus', listener)
    }
  }, [])

  // watch locker managers for updates
  useEffect(() => {
    if (!realtimeUpdates) return

    const listeners = Object.values(managers).map((manager) => ({
      provider: manager?.provider,
      filter: manager?.filters.TokenLockerCreated(),
      listener: async () => {
        const { chainId } = await manager?.provider.getNetwork()
        await updateCount(chainId)
      },
    }))

    // subscribe to event listeners
    listeners.forEach(({ provider, filter, listener }) => {
      provider?.on(filter, listener)
    })

    // cleanup
    return () => {
      // remove event listeners
      listeners.forEach(({ provider, filter, listener }) => {
        provider?.off(filter, listener)
      })
    }
  }, [managers, realtimeUpdates])

  // when `updateLockData` updates, setup timer data
  useEffect(() => {
    // clear existing timer if it exists
    timer && clearTimeout(timer)
    const _timer = setTimeout(updateLockData, 1250)
    // update state
    setLockDataTimer({
      // make note of last timer activity
      lastActivityAt: Date.now(),
      // timer reference
      timer: _timer,
    })
    // cleanup
    return () => {
      // clear the timer we made ref to, if it exists
      _timer && clearTimeout(_timer)
    }
  }, [updateLockData])

  return (
    <div className={'p-4'}>
      <LockerHeader />

      <PaginatedLocks
        locks={lockDataArray}
        displayAsList={displayAsList}
        alwaysShowLoadMoreButton={true}
        onChangeMaxLocksToDisplay={setMaxLocksToDisplay}
        onLoadMoreActivated={(button) => {
          if (isAtBottom()) {
            button.click()
          }
        }}
      />
    </div>
  )
}

export default LockerPage
