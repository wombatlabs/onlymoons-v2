import { ExtendedTokenLockData, TokenLockData } from '../types'

export function extendedTokenLockDataToTokenLockData(extendedTokenLockData: ExtendedTokenLockData) {
  if (!extendedTokenLockData) return null
  const { chainId: _chainId, ...lock } = extendedTokenLockData
  return lock as TokenLockData
}
