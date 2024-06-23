import { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  Header,
  LockDetailField,
  LockDetailFieldLabel,
  LockDetailFields,
  LockDetailFieldValue,
  LockDetails,
  LockNetwork,
  Root,
  TokenName,
  TokenSymbol,
  TopSection,
} from './styles'
import { useLockers, useSettings, useLocale } from '../../state/stores'
import { ExtendedTokenData, ExtendedTokenLockData, LockState, LPData, TokenLockData } from '../../types'
import { useTokenLockerManagerV1Contract } from '../../providers/Web3/TokenLockerManagerV1ContractProvider'
import { NetworkData } from '@onlymoons-io/networks'
import { useTokenCache } from '../../providers/Web3/TokenCacheProvider'
import { useLPCache } from '../../providers/Web3/LPCacheProvider'
import { HumanReadableDate } from '../HumanReadableDate'
import { LPInfo } from '../LockDetailsQuick/LPInfo'
import {
  constructLockerKey,
  getExplorerLink,
  getPercentOfBigNumber,
  getShortAddress,
  getTokenAmountPercent,
  sortLockDataArray,
} from '../../util'
import { LockDetailsQuick } from '../LockDetailsQuick'
import { GridLayout } from '../Layout/GridLayout'
import { useLocksForAddress } from '../../hooks/useLocksForAddress'
import { networkConnectors } from '../../providers/Web3/connectors/networkConnectors'
import { StyledLink } from '../StyledLink'
import { LockEvents } from './LockEvents'
import { ContractEventData } from '../ContractEventList'
import { HumanReadableTokenAmount } from '../HumanReadableTokenAmount'
import { StyledAnchor } from '../StyledAnchor'
import { useWeb3React } from '@web3-react/core'
import { ManageLock } from './ManageLock'
import { BigNumber } from 'ethers'
import { DexScreenerChart } from '../DexScreenerChart'
import { useDexScreenerPairMatches } from '../../hooks/useDexScreenerPairMatches'
import { FaGripVertical } from 'react-icons/fa6'
import { RxExternalLink } from 'react-icons/rx'
import { LockTypeLabel } from '../LockTypeLabel'

export interface ILockContext {
  chainId?: number
  lockData?: TokenLockData
  updateLockData: () => Promise<void>
  lockedTokenData?: ExtendedTokenData
  lockState: LockState
}

export const LockContext = createContext<ILockContext>({
  updateLockData: async () => {},
  lockState: 'unknown',
})

export const useLockContext = () => useContext(LockContext)

export interface LockDetailsFullProps {
  chainId: number
  lockId: number
}

export const LockDetailsFull: FC<LockDetailsFullProps> = ({ chainId, lockId }) => {
  const { account } = useWeb3React()
  const { getLockData: getCachedLockData, setLockData: setCachedLockData } = useLockers()
  const { getString: s } = useLocale()
  const { includeTestNets } = useSettings()
  const managers = useTokenLockerManagerV1Contract()
  const { getLiveTokenData: getTokenData } = useTokenCache()
  const { getCachedLpData, setCachedLpData, getLiveLpData } = useLPCache()
  const lockedNetworkData = useMemo<NetworkData | null>(() => {
    const foundNetworkConnector = networkConnectors({ includeTestNets }).find(([_1, _2, _3, thisNetworkData]) => {
      return chainId === thisNetworkData.chainId
    })
    if (!foundNetworkConnector) return null
    const [_1, _2, _3, foundNetworkData] = foundNetworkConnector
    return foundNetworkData ?? null
  }, [chainId, includeTestNets])
  const [lockData, setLockData] = useState<TokenLockData | null>(getCachedLockData(chainId, lockId))
  const [lockedTokenData, setLockedTokenData] = useState<ExtendedTokenData>()
  const [[pairTokenData0, pairTokenData1], setPairTokenData] = useState<
    [ExtendedTokenData | undefined, ExtendedTokenData | undefined]
  >([undefined, undefined])
  const [lpData, setLpData] = useState<LPData>()
  const lockState = useMemo<LockState>(() => {
    if (BigInt(BigNumber.from(lockData?.balance ?? '0').toString()) > 0n) {
      if (lockData) {
        if (lockData.unlockTime > Date.now() / 1000) {
          return 'locked'
        } else {
          return 'unlocked'
        }
      } else {
        return 'unknown'
      }
    } else {
      return 'empty'
    }
  }, [lockData, lockedTokenData?.balance])
  const otherLocksForToken = useLocksForAddress(chainId, lockData?.token, 20)
    ?.filter(({ id }) => id !== lockId)
    .sort(sortLockDataArray)
  const otherLocksForOwner = networkConnectors({ includeTestNets })
    .map(
      ([_network, _hooks, _state, { chainId: networkChainId }]) =>
        useLocksForAddress(networkChainId, lockData?.lockOwner, 20)?.map(
          (thisLockData) =>
            ({
              ...thisLockData,
              chainId: networkChainId,
            }) as ExtendedTokenLockData,
        ) ?? [],
    )
    .reduce((acc, value) => [...acc, ...value], [])
    .filter(({ id, chainId: otherChainId }) => !(id === lockId && otherChainId === chainId))
    .sort(sortLockDataArray)
  const otherLocksForCreator =
    lockData && lockData.lockOwner !== lockData.createdBy
      ? networkConnectors({ includeTestNets })
          .map(
            ([_network, _hooks, _state, { chainId: networkChainId }]) =>
              useLocksForAddress(networkChainId, lockData?.createdBy, 20)?.map(
                (thisLockData) =>
                  ({
                    ...thisLockData,
                    chainId: networkChainId,
                  }) as ExtendedTokenLockData,
              ) ?? [],
          )
          .reduce((acc, value) => [...acc, ...value], [])
          .filter(({ id, chainId: otherChainId }) => !(id === lockId && otherChainId === chainId))
          .sort(sortLockDataArray)
      : undefined
  const { pairs: lockedTokenPairs } = useDexScreenerPairMatches(
    chainId,
    !lockData?.isLpToken ? lockData?.token : undefined,
  )

  useEffect(() => {
    setLockData(null)
  }, [chainId, lockId])

  useEffect(() => {
    if (!lockData) {
      setLockedTokenData(undefined)
    }
  }, [lockData])

  const updateLockData = useCallback(async () => {
    // pull from cache first
    setLockData(getCachedLockData(chainId, lockId))
    // then update
    if (managers[chainId]) {
      try {
        const {
          id,
          lockOwner,
          contractAddress,
          token,
          isLpToken,
          createdBy,
          createdAt,
          unlockTime,
          balance,
          totalSupply,
        }: TokenLockData = await managers[chainId].getTokenLockData(lockId)
        const d: TokenLockData = {
          id,
          lockOwner,
          contractAddress,
          token,
          isLpToken,
          createdBy,
          createdAt,
          unlockTime,
          balance,
          totalSupply,
        }
        setCachedLockData(chainId, d)
        setLockData(d)
      } catch (err) {
        console.log(err)
        setLockData(null)
      }
    }
  }, [lockId, managers, chainId])

  useEffect(() => {
    updateLockData().catch(console.error)
  }, [updateLockData])

  useEffect(() => {
    if (lockData) {
      getTokenData(lockData.token, chainId)
        .then((result) => setLockedTokenData(result))
        .catch(console.error)
    } else {
      setLockedTokenData(undefined)
    }
  }, [lockData, chainId])

  useEffect(() => {
    if (lockData?.isLpToken) {
      getCachedLpData(chainId, lockData.token)
        .then(setLpData)
        .catch(console.error)
        .then(() => getLiveLpData(chainId, lockData.token))
        .then((freshLockData) => {
          if (freshLockData) {
            setLpData(freshLockData)
            return setCachedLpData(freshLockData, chainId)
          }
        })
        .catch(console.error)
    } else {
      setLpData(undefined)
    }
  }, [lockData, chainId])

  useEffect(() => {
    if (lpData) {
      Promise.all([getTokenData(lpData.token0, chainId), getTokenData(lpData.token1, chainId)])
        .then(([tokenData0, tokenData1]) => {
          setPairTokenData([tokenData0, tokenData1])
        })
        .catch(console.error)
    } else {
      setPairTokenData([undefined, undefined])
    }
  }, [lpData, chainId])

  return (
    <LockContext.Provider
      value={{ chainId, lockData: lockData || undefined, updateLockData, lockedTokenData, lockState }}
    >
      {(() => {
        if (lockData && lockedTokenData) {
          const createdAt = new Date(lockData.createdAt * 1000)
          const unlocksAt = new Date(lockData.unlockTime * 1000)

          return (
            <Root>
              <TopSection>
                <LockDetails>
                  <Header>
                    <LockNetwork>
                      <StyledLink $linkStyle={'none'} to={`/locker/${lockedNetworkData?.urlName}`}>
                        <span className={'hidden md:inline'}>{lockedNetworkData?.name ?? 'Unknown'}</span>
                        <span className={'inline md:hidden'}>{lockedNetworkData?.shortName ?? 'Unknown'}</span>
                      </StyledLink>
                    </LockNetwork>
                    <FaGripVertical className={'text-xs text-gray-300 dark:text-gray-700'} />
                    <TokenName>{lockedTokenData.name}</TokenName>
                    <TokenSymbol>{lockedTokenData.symbol}</TokenSymbol>
                  </Header>

                  <LockDetailFields>
                    <LockDetailField>
                      <LockDetailFieldLabel>{s`Type`} </LockDetailFieldLabel>
                      <LockDetailFieldValue>
                        <LockTypeLabel />
                      </LockDetailFieldValue>
                    </LockDetailField>
                    <LockDetailField>
                      <LockDetailFieldLabel>{s('Owned by')} </LockDetailFieldLabel>
                      <LockDetailFieldValue>
                        <StyledLink to={`/locker/search/${lockData.lockOwner}`}>
                          {getShortAddress(lockData.lockOwner)}
                        </StyledLink>
                      </LockDetailFieldValue>
                    </LockDetailField>
                    <LockDetailField>
                      <LockDetailFieldLabel>{s('Created at')}</LockDetailFieldLabel>
                      <LockDetailFieldValue className={'flex items-center gap-1'}>
                        <span>{createdAt.toLocaleString()} </span>
                        <span className={'text-sm'}>
                          (<HumanReadableDate date={createdAt} />)
                        </span>
                      </LockDetailFieldValue>
                    </LockDetailField>
                    <LockDetailField>
                      <LockDetailFieldLabel>
                        {s(`${lockData.unlockTime * 1000 > Date.now() ? 'Unlocks' : 'Unlocked'} at`)}
                      </LockDetailFieldLabel>
                      <LockDetailFieldValue className={'flex items-center gap-1'}>
                        <span>{unlocksAt.toLocaleString()} </span>
                        <span className={'text-sm'}>
                          (<HumanReadableDate date={unlocksAt} />)
                        </span>
                      </LockDetailFieldValue>
                    </LockDetailField>
                    <LockDetailField>
                      <LockDetailFieldLabel>{s('Lock contract')}</LockDetailFieldLabel>
                      <LockDetailFieldValue>
                        <StyledAnchor
                          className={'inline-flex items-center gap-1'}
                          href={getExplorerLink(chainId, `/address/${lockData.contractAddress}`)}
                        >
                          {getShortAddress(lockData.contractAddress)} <RxExternalLink opacity={0.7} />
                        </StyledAnchor>
                      </LockDetailFieldValue>
                    </LockDetailField>
                    <LockDetailField>
                      <LockDetailFieldLabel>{s('Locked token')}</LockDetailFieldLabel>
                      <LockDetailFieldValue>
                        <StyledAnchor
                          className={'inline-flex items-center gap-1'}
                          href={getExplorerLink(chainId, `/address/${lockedTokenData.address}`)}
                        >
                          {getShortAddress(lockData.token)} <RxExternalLink opacity={0.7} />
                        </StyledAnchor>
                      </LockDetailFieldValue>
                    </LockDetailField>
                    <LockDetailField>
                      <LockDetailFieldLabel>{s('Balance')}</LockDetailFieldLabel>
                      <LockDetailFieldValue>
                        <HumanReadableTokenAmount amount={lockData.balance} tokenData={lockedTokenData} precision={9} />
                      </LockDetailFieldValue>
                    </LockDetailField>
                    {lockData.isLpToken && lpData && pairTokenData0 && pairTokenData1 && lockedNetworkData && (
                      <>
                        <LockDetailField>
                          <LockDetailFieldLabel>{s('Pair')}</LockDetailFieldLabel>
                          <LockDetailFieldValue>
                            <LPInfo chainId={chainId} tokenData={lockedTokenData} />
                          </LockDetailFieldValue>
                        </LockDetailField>
                        <LockDetailField>
                          <LockDetailFieldLabel>
                            {s('Paired')} {pairTokenData0.symbol}
                          </LockDetailFieldLabel>
                          <LockDetailFieldValue>
                            <HumanReadableTokenAmount
                              amount={getPercentOfBigNumber(
                                lpData.balance0,
                                Math.ceil(getTokenAmountPercent(lockData.balance, lockedTokenData, 100)),
                              )}
                              tokenData={pairTokenData0}
                              precision={9}
                            />
                          </LockDetailFieldValue>
                        </LockDetailField>
                        <LockDetailField>
                          <LockDetailFieldLabel>
                            {s('Paired')} {pairTokenData1.symbol}
                          </LockDetailFieldLabel>
                          <LockDetailFieldValue>
                            <HumanReadableTokenAmount
                              amount={getPercentOfBigNumber(
                                lpData.balance1,
                                Math.ceil(getTokenAmountPercent(lockData.balance, lockedTokenData, 100)),
                              )}
                              tokenData={pairTokenData1}
                              precision={9}
                            />
                          </LockDetailFieldValue>
                        </LockDetailField>
                      </>
                    )}
                    {lockData.lockOwner === account && (
                      <>
                        <hr className={'my-2 border-secondary-100 dark:border-secondary-950'} />
                        <ManageLock />
                      </>
                    )}

                    <hr className={'my-2 border-secondary-100 dark:border-secondary-950'} />

                    <LockEvents
                      lockId={lockId}
                      chainId={chainId}
                      defaultEvents={[
                        ...(lockData.unlockTime * 1000 <= Date.now()
                          ? [
                              {
                                message: s('Unlocked'),
                                type: 'unlock',
                                time: new Date(lockData.unlockTime * 1000),
                              } as ContractEventData,
                            ]
                          : []),
                        {
                          message: s('Created'),
                          type: 'create',
                          // subtract 1 ms from createdAt, to make sure this always sorts
                          // below other events, but doesn't effect timestamps
                          time: new Date(lockData.createdAt * 1000 - 1),
                        },
                      ]}
                    />
                  </LockDetailFields>
                </LockDetails>

                <div className={'grow'}>
                  {lockData.isLpToken ? (
                    <DexScreenerChart
                      chainId={chainId}
                      pairAddress={lockData.token}
                      className={'h-full min-h-[640px]'}
                    />
                  ) : lockedTokenPairs && lockedTokenPairs[0] ? (
                    <DexScreenerChart
                      chainId={chainId}
                      pairAddress={lockedTokenPairs[0].pairAddress}
                      className={'h-full min-h-[640px]'}
                    />
                  ) : (
                    <>Couldn't find a chart :(</>
                  )}
                </div>
              </TopSection>

              <hr className={'my-4 border-secondary-100 dark:border-secondary-950'} />
              <div>
                <div className={'py-1 bg-white dark:bg-black sticky top-[54px] z-10 text-lg'}>
                  {s('More locks for token')}{' '}
                  <StyledLink to={`/locker/search/${lockData.token}`}>{getShortAddress(lockData.token)}</StyledLink>
                </div>
                {otherLocksForToken ? (
                  otherLocksForToken.length !== 0 ? (
                    <GridLayout
                      className={'my-2'}
                      items={otherLocksForToken.map((otherLockData) => ({
                        key: constructLockerKey(chainId, otherLockData.id),
                        item: <LockDetailsQuick chainId={chainId} lockData={otherLockData} disableListView={true} />,
                      }))}
                    />
                  ) : (
                    <>None</>
                  )
                ) : (
                  <>Loading...</>
                )}
              </div>
              <hr className={'my-4 border-secondary-100 dark:border-secondary-950'} />
              <div>
                <div className={'py-1 bg-white dark:bg-black sticky top-[54px] z-10 text-lg'}>
                  {s('More locks owned by')}{' '}
                  <StyledLink to={`/locker/search/${lockData.lockOwner}`}>
                    {getShortAddress(lockData.lockOwner)}
                  </StyledLink>
                </div>
                <GridLayout
                  className={'my-2'}
                  items={otherLocksForOwner.map(({ chainId: otherChainId, ...otherLockData }) => ({
                    key: constructLockerKey(otherChainId, otherLockData.id),
                    item: <LockDetailsQuick chainId={otherChainId} lockData={otherLockData} disableListView={true} />,
                  }))}
                />
              </div>
              {otherLocksForCreator && (
                <>
                  <hr className={'my-4 border-secondary-100 dark:border-secondary-950'} />
                  <div>
                    <div>
                      {s('Other locks for creator')}{' '}
                      <StyledLink to={`/locker/search/${lockData.createdBy}`}>
                        {getShortAddress(lockData.createdBy)}
                      </StyledLink>
                    </div>
                    <GridLayout
                      className={'my-2'}
                      items={otherLocksForCreator.map(({ chainId: otherChainId, ...otherLockData }) => ({
                        key: constructLockerKey(otherChainId, otherLockData.id),
                        item: (
                          <LockDetailsQuick chainId={otherChainId} lockData={otherLockData} disableListView={true} />
                        ),
                      }))}
                    />
                  </div>
                </>
              )}
            </Root>
          )
        }

        return <>Loading lock data...</>
      })()}
    </LockContext.Provider>
  )
}
