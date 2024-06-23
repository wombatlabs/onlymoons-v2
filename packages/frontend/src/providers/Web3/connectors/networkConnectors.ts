import { networks } from '@onlymoons-io/networks'
import { generateNetworkConnector } from './network'

const allConnectors = Object.values(networks)
  .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))
  .map((network) => generateNetworkConnector({ network }))

export interface NetworkConnectorsOptions {
  includeTestNets?: boolean
}

/**
 *
 * @param includeTestNets whether or not to include testnets. defaults to `true`.
 */
export const networkConnectors = ({ includeTestNets = true }: NetworkConnectorsOptions = {}) =>
  allConnectors.filter(([_network, _hooks, _store, network]) => includeTestNets || !network.isTestNet)
