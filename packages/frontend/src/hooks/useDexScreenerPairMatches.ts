import { useEffect, useMemo, useState } from 'react'
import { getDexScreenerChainId } from '../util/getDexScreenerChainId'
import { DexScreenerPair } from '../types'

export const useDexScreenerPairMatches = (chainId?: number, tokenAddress?: string) => {
  const dexScreenerChainId = useMemo(() => getDexScreenerChainId(chainId), [chainId])
  const [pairs, setPairs] = useState<DexScreenerPair[]>([])

  useEffect(() => {
    setPairs([])
    fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`)
      .then((response) => response.json())
      .then((body) => (body.pairs ?? []) as DexScreenerPair[])
      .then((pairs) => pairs.filter((pair) => pair.chainId === dexScreenerChainId))
      .then(setPairs)
      .catch((err) => {
        console.log(err)
        setPairs([])
      })
  }, [dexScreenerChainId, tokenAddress])

  return { pairs }
}
