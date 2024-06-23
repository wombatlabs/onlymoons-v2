import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ExtendedTokenLockData } from '../../types'
import { constructLockerKey } from '../../util'
import { LockDetailsQuick } from '../LockDetailsQuick'
import { limitArraySize, isAtBottom } from '../../util'
import { LoadMoreButtonWrapper, Root } from './styles'
import { Button } from '../Button'
import { LoadingSpinner } from '../LoadingSpinner'
import { GridLayout } from '../Layout/GridLayout'

/**
 * returns the number of locks to load at once, based on window size
 */
function getNumLocksToAdd(windowSizeModifier = 0.01): number {
  // always prefer to round up, so use `Math.ceil`
  return Math.ceil((globalThis.innerWidth + globalThis.innerHeight) * windowSizeModifier)
}

export interface PaginatedLocksProps {
  locks: Array<ExtendedTokenLockData>
  loadMoreCooldownDuration?: number
  alwaysShowLoadMoreButton?: boolean
  displayAsList?: boolean
  onChangeMaxLocksToDisplay?: (maxLocksToDisplay: number) => void
  onLoadMoreActivated?: (button: HTMLButtonElement) => void
  onLoadMoreDeactivated?: (button: HTMLButtonElement) => void
}

export const PaginatedLocks: FC<PaginatedLocksProps> = ({
  locks,
  loadMoreCooldownDuration = 1500,
  alwaysShowLoadMoreButton = false,
  displayAsList = false,
  onChangeMaxLocksToDisplay,
  onLoadMoreActivated,
  onLoadMoreDeactivated,
}) => {
  const [maxLocksToDisplay, setMaxLocksToDisplay] = useState<number>(getNumLocksToAdd())
  const filteredLocks = useMemo<Array<ExtendedTokenLockData>>(
    () => limitArraySize(locks, maxLocksToDisplay),
    [locks, maxLocksToDisplay],
  )
  const [loading, setLoading] = useState<boolean>(true)
  const loadMoreButton = useRef<HTMLButtonElement>(null)

  const addMaxLocksToDisplay = useCallback(() => {
    if (!loading) {
      setMaxLocksToDisplay((value) => value + getNumLocksToAdd())
      setLoading(true)
    }
  }, [loading])

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, loadMoreCooldownDuration)
      return () => {
        timer && clearTimeout(timer)
      }
    }
  }, [loading])

  useEffect(() => {
    if (loadMoreButton.current) {
      if (loading) {
        onLoadMoreDeactivated?.call(null, loadMoreButton.current)
      } else {
        onLoadMoreActivated?.call(null, loadMoreButton.current)
      }
    }
  }, [loading, onLoadMoreActivated, onLoadMoreDeactivated])

  // auto load scroll events
  useEffect(() => {
    const onScroll = (_e: Event) => {
      if (isAtBottom()) {
        addMaxLocksToDisplay()
      }
    }

    globalThis.addEventListener('scroll', onScroll)

    return () => {
      globalThis.removeEventListener('scroll', onScroll)
    }
  }, [addMaxLocksToDisplay])

  useEffect(() => {
    onChangeMaxLocksToDisplay?.call(null, maxLocksToDisplay)
  }, [maxLocksToDisplay, onChangeMaxLocksToDisplay])

  return (
    <Root>
      <GridLayout
        className={'mt-4 mb-2'}
        $list={displayAsList}
        items={filteredLocks.map(({ chainId, ...lock }) => ({
          key: constructLockerKey(chainId, lock.id),
          item: <LockDetailsQuick chainId={chainId} lockData={lock} />,
        }))}
      />

      {(alwaysShowLoadMoreButton || maxLocksToDisplay < locks.length) && (
        <LoadMoreButtonWrapper>
          <Button
            className={'flex items-center justify-center'}
            ref={loadMoreButton}
            disabled={loading}
            onClick={addMaxLocksToDisplay}
          >
            <LoadingSpinner $loading={loading} className={'absolute'} />
            <div className={`${loading ? 'opacity-0' : ''}`}>Load more</div>
          </Button>
        </LoadMoreButtonWrapper>
      )}
    </Root>
  )
}
