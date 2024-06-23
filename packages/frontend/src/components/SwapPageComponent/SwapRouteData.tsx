import { FC, useMemo } from 'react'
import { SwapRouteDataRoot, SwapRouteDataTop } from './styles'
import { QuoteType } from './SwapSectionComponent'
import { SwapRouter } from '../../data/SwapRouters'
import { DexScreenerPair } from '../../types'
import { SwapRouteDataPair } from './SwapRouteDataPair'
import { RxArrowDown } from 'react-icons/rx'

export interface SwapRouteDataProps {
  router?: SwapRouter
  quote?: QuoteType
  pairs?: Array<DexScreenerPair>
}

export const SwapRouteData: FC<SwapRouteDataProps> = ({ router, quote, pairs }) => {
  const [fromAddress, toAddress] = useMemo<[fromAddress?: string, toAddress?: string]>(() => {
    if (!quote?.quote) return []
    return [quote.quote.path[0].token0, quote.quote.path[quote.quote.path.length - 1].token1]
  }, [quote])
  const [fromPair, toPair] = useMemo<[fromPair?: DexScreenerPair, toPair?: DexScreenerPair]>(() => {
    if (!quote?.quote?.path) return []
    return [
      pairs?.find(({ pairAddress }) => pairAddress === quote.quote?.path[0].pairAddress),
      pairs?.find(({ pairAddress }) => pairAddress === quote.quote?.path[quote.quote.path.length - 1].pairAddress),
    ]
  }, [pairs, fromAddress, toAddress])

  return (
    <SwapRouteDataRoot>
      {/*<SwapRouteDataTop>Swap!</SwapRouteDataTop>*/}
      <div className={'flex flex-col gap-1'}>
        {/*<div className={'flex flex-col justify-center items-center'}>*/}
        {/*  {fromPair ? (*/}
        {/*    <>*/}
        {/*      <div className={'text-xl'}>*/}
        {/*        {fromPair.baseToken.symbol} / {fromPair.quoteToken.symbol}*/}
        {/*      </div>*/}
        {/*      {fromPair.fdv && (*/}
        {/*        <div className={'text-sm'}>*/}
        {/*          <span className={'opacity-50'}>FDV:</span> $*/}
        {/*          {fromPair.fdv.toLocaleString(undefined, { maximumFractionDigits: 2 })}*/}
        {/*        </div>*/}
        {/*      )}*/}
        {/*    </>*/}
        {/*  ) : (*/}
        {/*    <></>*/}
        {/*  )}*/}
        {/*</div>*/}
        {/*<div className={'flex flex-col justify-center items-center'}>*/}
        {/*  {toPair ? (*/}
        {/*    <>*/}
        {/*      <div className={'text-xl'}>*/}
        {/*        {toPair.baseToken.symbol} / {toPair.quoteToken.symbol}*/}
        {/*      </div>*/}
        {/*      {toPair.fdv && (*/}
        {/*        <div className={'text-sm'}>*/}
        {/*          <span className={'opacity-50'}>FDV:</span> $*/}
        {/*          {toPair.fdv.toLocaleString(undefined, { maximumFractionDigits: 2 })}*/}
        {/*        </div>*/}
        {/*      )}*/}
        {/*    </>*/}
        {/*  ) : (*/}
        {/*    <></>*/}
        {/*  )}*/}
        {/*</div>*/}
        {/**/}
        {/**/}
        {router &&
          quote?.quote?.path.map((routePath, index, array) => (
            <>
              <SwapRouteDataPair
                key={`${router.code}_${routePath.token0}_${routePath.token1}`}
                token0={routePath.token0}
                token1={routePath.token1}
                // pairs={pairs}
                pair={pairs?.find(({ pairAddress }) => pairAddress === routePath.pairAddress)}
              />
              {index < array.length - 1 && (
                <div className={'flex justify-center items-center'}>
                  <RxArrowDown />
                </div>
              )}
            </>
          ))}
      </div>
    </SwapRouteDataRoot>
  )
}
