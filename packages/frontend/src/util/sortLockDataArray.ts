import { TokenLockData, ExtendedTokenLockData } from '../types'

export function sortLockDataArray(a: TokenLockData | ExtendedTokenLockData, b: TokenLockData | ExtendedTokenLockData) {
  return a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
}
