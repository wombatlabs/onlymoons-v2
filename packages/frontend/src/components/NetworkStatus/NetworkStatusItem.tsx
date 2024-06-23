import { FC, HTMLAttributes } from 'react'
import { NetworkLabel, NetworkStatusItemRoot, StatusIcon } from './styles'
import { Web3ReactHooks } from '@web3-react/core'
import { NetworkData } from '@onlymoons-io/networks'
import { Connector } from '@web3-react/types'

export interface NetworkStatusIconProps extends HTMLAttributes<HTMLDivElement> {
  readonly connector: Connector
  readonly hooks: Web3ReactHooks
  readonly network: NetworkData
}

export const NetworkStatusItem: FC<NetworkStatusIconProps> = ({ connector, hooks, network, ...rest }) => {
  const { useIsActive, useChainId } = hooks
  const isActive = useIsActive()
  const chainId = useChainId()
  const isConnected = isActive && chainId === network.chainId

  return (
    <NetworkStatusItemRoot {...rest}>
      <StatusIcon $status={isConnected ? 'ready' : 'error'} />
      <NetworkLabel>{network.name}</NetworkLabel>
    </NetworkStatusItemRoot>
  )
}
