import { FC, HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react'
import {
  Root,
  Title,
  Timestamp,
  NetworkLabel,
  TokenName,
  TokenSymbol,
  LockedAmount,
  Timestamps,
  Toolbar,
  Content,
} from './styles'
import { ExtendedTokenData, TokenLockData } from '../../types'
import { getNetworkDataByChainId, NetworkData } from '@onlymoons-io/networks'
import { useTokenCache } from '../../providers/Web3/TokenCacheProvider'
import { HumanReadableDate } from '../HumanReadableDate'
import networkIcons from '../../assets/network-icons'
import { LPInfo } from './LPInfo'
import { LockDetailsQuickSkeleton } from './LockDetailsQuickSkeleton'
import { useLockerFiltersState } from '../LockerFilters'
import { HumanReadableTokenAmount } from '../HumanReadableTokenAmount'

/**
 * duration in ms to delay loading token data.
 * this can prevent jitter while lock data is loading and sorting.
 */
const UPDATE_LOCKED_TOKEN_DATA_DELAY = 0

export interface LockDetailsQuickProps extends HTMLAttributes<HTMLDivElement> {
  chainId: number
  lockData: TokenLockData
  disableListView?: boolean
}

export const LockDetailsQuick: FC<LockDetailsQuickProps> = ({ chainId, lockData, disableListView }) => {
  const [lockedTokenData, setLockedTokenData] = useState<ExtendedTokenData>()
  const tokenDataDelay = useRef<NodeJS.Timeout>()
  const [networkData, setNetworkData] = useState<NetworkData>()
  const { getTokenData } = useTokenCache()
  const { displayAsList: displayAsListFromState } = useLockerFiltersState()
  const displayAsList = disableListView ? false : displayAsListFromState

  useEffect(() => {
    // sometimes chainId is actually a string, so ummmm...
    // convert it to a string, and then convert to integer.
    // maybe track down why this was happening and fix it there.
    setNetworkData(getNetworkDataByChainId(parseInt(`${chainId}`)))
  }, [chainId])

  const updateLockedTokenData = useCallback(() => {
    tokenDataDelay.current && clearTimeout(tokenDataDelay.current)
    if (lockData?.token) {
      getTokenData(lockData.token, chainId)
        .then(setLockedTokenData)
        // .then(() => getLiveTokenData(lockData.token, chainId))
        // .then(setLockedTokenData)
        .catch((_err: Error) => {
          // console.log(_err)
          setLockedTokenData(undefined)
        })
    } else {
      setLockedTokenData(undefined)
    }
  }, [lockData?.token, chainId])

  useEffect(() => {
    tokenDataDelay.current && clearTimeout(tokenDataDelay.current)
    tokenDataDelay.current = setTimeout(updateLockedTokenData, UPDATE_LOCKED_TOKEN_DATA_DELAY)
    const { current } = tokenDataDelay
    return () => {
      current && clearTimeout(current)
    }
  }, [updateLockedTokenData])

  return lockedTokenData ? (
    <Root $list={displayAsList} to={`/locker/${networkData?.urlName}/${lockData.id}`}>
      <>
        <Toolbar>
          <NetworkLabel>
            {/*<div>{networkData?.shortName ?? chainId}</div>*/}
            {networkData && (
              <img
                src={networkIcons[networkData.chainId]}
                alt={`${networkData?.shortName ?? chainId}`}
                width={20}
                height={20}
              />
            )}
          </NetworkLabel>
        </Toolbar>
        <Content $list={displayAsList}>
          <Title>
            {lockData.isLpToken ? (
              <LPInfo chainId={chainId} tokenData={lockedTokenData} displayAsLinks={false} />
            ) : (
              <TokenName>{lockedTokenData.name}</TokenName>
            )}
            <TokenSymbol>{lockedTokenData.symbol}</TokenSymbol>
          </Title>

          <LockedAmount $list={displayAsList}>
            <HumanReadableTokenAmount amount={lockData.balance} tokenData={lockedTokenData} />
          </LockedAmount>

          <Timestamps $list={displayAsList}>
            <Timestamp>
              Created <HumanReadableDate date={new Date(lockData.createdAt * 1000)} />
            </Timestamp>
            <Timestamp>
              {lockData.unlockTime * 1000 > Date.now() ? 'Unlocks' : 'Unlocked'}{' '}
              <HumanReadableDate date={new Date(lockData.unlockTime * 1000)} />
            </Timestamp>
          </Timestamps>
        </Content>
      </>
    </Root>
  ) : (
    <LockDetailsQuickSkeleton />
  )
}
