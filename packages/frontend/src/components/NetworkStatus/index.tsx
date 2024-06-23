import { FC, useEffect, useState } from 'react'
import { NetworkLabel, NetworkStatusItemRoot, NetworkStatusItems, Root, StatusIcon } from './styles'
import { NetworkStatusItem } from './NetworkStatusItem'
import { networkConnectors } from '../../providers/Web3/connectors/networkConnectors'
import { Network } from '@web3-react/network'
import { useWeb3React } from '@web3-react/core'
import { getNetworkDataByChainId, NetworkData } from '@onlymoons-io/networks'
import { useLocale, useSettings } from '../../state/stores'
import { MouseoverElement } from '../MouseoverElement'

export const NetworkStatus: FC = () => {
  const { includeTestNets } = useSettings()
  const { getString: s } = useLocale()
  const { connector, hooks, chainId, account } = useWeb3React()
  const [networkData, setNetworkData] = useState<NetworkData>()

  useEffect(() => {
    setNetworkData(chainId ? getNetworkDataByChainId(chainId) : undefined)
  }, [chainId])

  return !account ? (
    <></>
  ) : networkData && hooks ? (
    <NetworkStatusItemRoot>
      <StatusIcon $status={'ready'} />
      <NetworkLabel>{networkData.name}</NetworkLabel>
    </NetworkStatusItemRoot>
  ) : !(connector instanceof Network) ? (
    <NetworkStatusItemRoot>
      <StatusIcon $status={'error'} />
      {/* why doesn't getString from useLocale work here?? */}
      <NetworkLabel>{s('Unsupported')}</NetworkLabel>
    </NetworkStatusItemRoot>
  ) : (
    <NetworkStatusItemRoot>
      <StatusIcon $status={'ready'} />
      <NetworkLabel>{s('Networks')}</NetworkLabel>
    </NetworkStatusItemRoot>
  )
  // <MouseoverElement
  //   label={
  //     networkData && hooks ? (
  //       <NetworkStatusItemRoot>
  //         <StatusIcon $status={'ready'} />
  //         <NetworkLabel>{networkData.name}</NetworkLabel>
  //       </NetworkStatusItemRoot>
  //     ) : !(connector instanceof Network) ? (
  //       <NetworkStatusItemRoot>
  //         <StatusIcon $status={'error'} />
  //         {/* why doesn't getString from useLocale work here?? */}
  //         <NetworkLabel>{s('Unsupported')}</NetworkLabel>
  //       </NetworkStatusItemRoot>
  //     ) : (
  //       <NetworkStatusItemRoot>
  //         <StatusIcon $status={'ready'} />
  //         <NetworkLabel>{s('Networks')}</NetworkLabel>
  //       </NetworkStatusItemRoot>
  //     )
  //   }
  //   element={
  //     <NetworkStatusItems>
  //       {networkConnectors({ includeTestNets }).map(([network, networkHooks, _networkStore, networkData]) => (
  //         <NetworkStatusItem
  //           key={networkData.chainId}
  //           connector={network}
  //           hooks={networkHooks}
  //           network={networkData}
  //         />
  //       ))}
  //     </NetworkStatusItems>
  //   }
  // />
}
