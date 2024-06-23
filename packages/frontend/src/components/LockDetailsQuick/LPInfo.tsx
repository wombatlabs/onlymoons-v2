import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { LPInfo as LPInfoStyle, LPInfoPairName } from './styles'
import { LPData } from '../../types'
import { TokenData } from '@onlymoons-io/networks'
import { useTokenCache } from '../../providers/Web3/TokenCacheProvider'
import { useLPCache } from '../../providers/Web3/LPCacheProvider'
import { LPIcon } from './LPIcon'
import { LPInfoSkeleton } from './LPInfoSkeleton'
import { StyledLink } from '../StyledLink'

export interface LPInfoProps {
  chainId: number
  tokenData: TokenData
  displayAsLinks?: boolean
  loadingElement?: ReactNode
  loadingTimeoutDuration?: number
  loadingTimeoutElement?: ReactNode
}

export const LPInfo: FC<LPInfoProps> = ({
  chainId,
  tokenData,
  displayAsLinks = true,
  loadingElement = <LPInfoSkeleton />,
  loadingTimeoutDuration = 5000,
  loadingTimeoutElement = (
    <LPInfoPairName>
      <span>???</span> <LPIcon /> <span>???</span>
    </LPInfoPairName>
  ),
}) => {
  const { getLpData } = useLPCache()
  const [[pairTokenData0, pairTokenData1], setPairTokenData] = useState<[TokenData | undefined, TokenData | undefined]>(
    [undefined, undefined],
  )
  const [lpData, setLpData] = useState<LPData>()
  const { getTokenData } = useTokenCache()
  const pairName = useMemo<ReactNode | undefined>(() => {
    if (!pairTokenData0 || !pairTokenData1) return undefined
    return (
      <LPInfoPairName>
        {displayAsLinks ? (
          <StyledLink to={`/locker/search/${pairTokenData0.address}`}>{pairTokenData0.symbol}</StyledLink>
        ) : (
          <span>{pairTokenData0.symbol}</span>
        )}
        <LPIcon />
        {displayAsLinks ? (
          <StyledLink to={`/locker/search/${pairTokenData1.address}`}>{pairTokenData1.symbol}</StyledLink>
        ) : (
          <span>{pairTokenData1.symbol}</span>
        )}
      </LPInfoPairName>
    )
  }, [pairTokenData0, pairTokenData1])
  const [timedOut, setTimedOut] = useState<boolean>(false)
  const timer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    getLpData(tokenData.address, chainId).then(setLpData).catch(console.error)
  }, [getLpData, chainId, tokenData.address])

  useEffect(() => {
    if (lpData) {
      Promise.all([getTokenData(lpData.token0, chainId), getTokenData(lpData.token1, chainId)])
        .then(setPairTokenData)
        .catch(console.error)
        .then(() => setTimedOut(false))
    } else {
      setPairTokenData([undefined, undefined])
    }
  }, [lpData?.token0, lpData?.token1, chainId])

  useEffect(() => {
    timer.current = setTimeout(() => {
      setTimedOut(true)
    }, loadingTimeoutDuration)

    return () => {
      timer.current && clearTimeout(timer.current)
    }
  }, [loadingTimeoutDuration])

  useEffect(() => {
    if (pairName && timer.current) {
      clearTimeout(timer.current)
    }
  }, [pairName])

  return <LPInfoStyle>{timedOut ? loadingTimeoutElement : pairName ? <>{pairName}</> : loadingElement}</LPInfoStyle>
}
