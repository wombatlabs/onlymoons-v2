import { FC } from 'react'
import { CountList, CountListIndex, CountListItem, CountListNetwork, LockCount, NetworkName, Overlay } from './styles'
import { useLockers, useSettings, useLocale } from '../../state/stores'
import { networkConnectors } from '../../providers/Web3/connectors/networkConnectors'
import { MouseoverElement } from '../MouseoverElement'
import { FaInfoCircle } from 'react-icons/fa'

export interface LockCountWithOverlayProps {
  //
}

export const LockCountWithOverlay: FC<LockCountWithOverlayProps> = () => {
  const { includeTestNets } = useSettings()
  const { getString: s } = useLocale()
  const { getCount, getTotalCount } = useLockers()

  return (
    <MouseoverElement
      label={
        <span className={'flex items-center gap-1'}>
          <span>
            {getTotalCount()} {s('locks')}
          </span>
          <FaInfoCircle className={'text-primary-500 opacity-70'} />
        </span>
      }
      element={
        <Overlay>
          <CountList>
            {networkConnectors({ includeTestNets })
              .map(([_network, _hooks, _state, { name, chainId }]) => ({ name, chainId, count: getCount(chainId) }))
              .sort(({ count: ca }, { count: cb }) => (ca > cb ? -1 : ca < cb ? 1 : 0))
              .map(({ name, count, chainId }, index) => (
                <CountListItem key={chainId}>
                  <CountListNetwork>
                    <CountListIndex>{index + 1}.</CountListIndex> <NetworkName>{name}</NetworkName>
                  </CountListNetwork>
                  <LockCount>{count}</LockCount>
                </CountListItem>
              ))}
          </CountList>
        </Overlay>
      }
    />
  )
}
