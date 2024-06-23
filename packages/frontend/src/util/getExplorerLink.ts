import { networkConnectors } from '../providers/Web3/connectors/networkConnectors'

export function getExplorerLink(chainId: number, route: string): string | undefined {
  const networkConnector = networkConnectors().find(([_1, _2, _3, { chainId: thisChainId }]) => chainId === thisChainId)
  if (!networkConnector) return undefined
  const [_1, _2, _3, { explorerURL }] = networkConnector
  // ensure baseUrl includes a trailing slash
  const baseUrl = `${explorerURL}${!explorerURL.endsWith('/') ? '/' : ''}`
  // ensure route does not include a leading slash
  const routeUrl = route.startsWith('/') ? route.substring(1) : route
  return baseUrl + routeUrl
}
