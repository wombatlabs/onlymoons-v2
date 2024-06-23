import { FC, HTMLAttributes, useEffect, useState } from 'react'
import { Colors, DexScreenerPair } from '../../types'
import {
  SwapRouteDataPairGrid,
  SwapRouteDataPairGridItem,
  SwapRouteDataPairRoot,
  SwapRouteDataPairSymbol,
  // SwapRouteDataPairVolume,
  // SwapRouteDataPairVolumeItem,
} from './styles'
// import humanNumber from 'human-number'
import { Button } from '../Button'
import { useLocale } from '../../state/stores'
import { RxArrowRight, RxBarChart } from 'react-icons/rx'

export interface SwapRouteDataPairProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  token0: string
  token1: string
  pair?: DexScreenerPair
}

export const SwapRouteDataPair: FC<SwapRouteDataPairProps> = ({ token0, token1, pair, ...props }) => {
  const { getString: s } = useLocale()
  const [baseOrQuote, setBaseOrQuote] = useState<'base' | 'quote' | undefined>()

  useEffect(() => {
    if (pair) {
      if (pair.baseToken.address === token0) {
        setBaseOrQuote('base')
      } else {
        setBaseOrQuote('quote')
      }
    } else {
      setBaseOrQuote(undefined)
    }
  }, [pair])

  return (
    <SwapRouteDataPairRoot {...props}>
      {pair && baseOrQuote !== undefined ? (
        <>
          <div className={'flex flex-col justify-between items-center'}>
            <SwapRouteDataPairGrid>
              <SwapRouteDataPairGridItem>
                <SwapRouteDataPairSymbol>
                  {pair[baseOrQuote === 'base' ? 'baseToken' : 'quoteToken'].symbol}
                </SwapRouteDataPairSymbol>
              </SwapRouteDataPairGridItem>
              <SwapRouteDataPairGridItem>
                <RxArrowRight />
              </SwapRouteDataPairGridItem>
              <SwapRouteDataPairGridItem>
                <SwapRouteDataPairSymbol>
                  {pair[baseOrQuote === 'base' ? 'quoteToken' : 'baseToken'].symbol}
                </SwapRouteDataPairSymbol>
              </SwapRouteDataPairGridItem>
            </SwapRouteDataPairGrid>
            <div className={'flex items-center justify-center gap-3 text-sm font-text'}>
              {pair.fdv && (
                <div className={'mb-2'}>
                  <span className={'opacity-50'}>{s('Market cap')}:</span>{' '}
                  <span>${pair.fdv.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {pair.liquidity?.usd && (
                <div className={'mb-2'}>
                  <span className={'opacity-50'}>{s('Pooled')}:</span>{' '}
                  <span>${pair.liquidity.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
            {/*<SwapRouteDataPairVolume>*/}
            {/*  <SwapRouteDataPairVolumeItem>*/}
            {/*    <span className={'opacity-50'}>5m:</span>*/}
            {/*    <span>*/}
            {/*      ${humanNumber(pair.volume.m5, (n) => n.toLocaleString(undefined, { maximumFractionDigits: 2 }))}*/}
            {/*    </span>*/}
            {/*  </SwapRouteDataPairVolumeItem>*/}
            {/*  <SwapRouteDataPairVolumeItem>*/}
            {/*    <span className={'opacity-50'}>1h:</span>*/}
            {/*    <span>*/}
            {/*      ${humanNumber(pair.volume.h1, (n) => n.toLocaleString(undefined, { maximumFractionDigits: 2 }))}*/}
            {/*    </span>*/}
            {/*  </SwapRouteDataPairVolumeItem>*/}
            {/*  <SwapRouteDataPairVolumeItem>*/}
            {/*    <span className={'opacity-50'}>6h:</span>*/}
            {/*    <span>*/}
            {/*      ${humanNumber(pair.volume.h6, (n) => n.toLocaleString(undefined, { maximumFractionDigits: 2 }))}*/}
            {/*    </span>*/}
            {/*  </SwapRouteDataPairVolumeItem>*/}
            {/*  <SwapRouteDataPairVolumeItem>*/}
            {/*    <span className={'opacity-50'}>24h:</span>*/}
            {/*    <span>*/}
            {/*      ${humanNumber(pair.volume.h24, (n) => n.toLocaleString(undefined, { maximumFractionDigits: 2 }))}*/}
            {/*    </span>*/}
            {/*  </SwapRouteDataPairVolumeItem>*/}
            {/*</SwapRouteDataPairVolume>*/}
          </div>
          <Button
            $color={Colors.ghost}
            className={'absolute top-0 right-0 w-10 h-10 p-0 flex items-center justify-center'}
          >
            <RxBarChart />
          </Button>
        </>
      ) : (
        <>{s('Could not find pair data')}</>
      )}
    </SwapRouteDataPairRoot>
  )
}
