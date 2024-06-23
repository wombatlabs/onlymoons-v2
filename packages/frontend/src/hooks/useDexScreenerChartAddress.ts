import { useMemo } from 'react'
import { useDarkMode } from 'use-dark-mode-ts'
import { getDexScreenerChainId } from '../util/getDexScreenerChainId'

export const useDexScreenerChartAddress = (chainId?: number, pairAddress?: string) => {
  const isDarkMode = useDarkMode()
  const dexScreenerChainId = useMemo(() => getDexScreenerChainId(chainId), [chainId])
  const chartAddress = useMemo<string | undefined>(() => {
    if (dexScreenerChainId && pairAddress)
      return `https://dexscreener.com/${dexScreenerChainId}/${pairAddress}?embed=1&theme=${
        isDarkMode ? 'dark' : 'light'
      }&trades=1&info=0`
    return undefined
  }, [dexScreenerChainId, pairAddress, isDarkMode])

  return { chartAddress }
}
