export function getDexScreenerChainId(chainId?: number) {
  switch (chainId) {
    default:
      return undefined
    case 1:
      return 'ethereum'
    case 25:
      return 'cronos'
    case 56:
      return 'bsc'
    case 109:
      return 'shibarium'
    case 122:
      return 'fuse'
    case 137:
      return 'polygon'
    case 169:
      return 'manta'
    case 204:
      return 'opbnb'
    case 314:
      return 'filecoin'
    case 369:
      return 'pulsechain'
    case 592:
      return 'astar'
    case 1030:
      return 'conflux'
    case 1088:
      return 'metis'
    case 2000:
      return 'dogechain'
    case 2001:
      return 'milkomedacardano'
    case 4200:
      return 'merlin'
    case 5000:
      return 'mantle'
    case 7000:
      return 'zeta'
    case 7700:
      return 'canto'
    case 8453:
      return 'base'
    case 10001:
      return 'ethereumpow'
    case 42161:
      return 'arbitrum'
    case 43114:
      return 'avalanche'
    case 59144:
      return 'linea'
    case 81457:
      return 'blast'
    case 534352:
      return 'scroll'
    case 7777777:
      return 'zora'
    case 20202021:
      return 'poochain'
    case 245022934:
      return 'neonevm'
    case 666666666:
      return 'degenchain'
  }
}
