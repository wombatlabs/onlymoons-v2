import tw from 'tailwind-styled-components'
import { Button } from '../Button'

export const Root = tw.div`
  flex
  items-stretch
  gap-6
  p-4
  fixed
  inset-0
  top-14
`

export const TopArea = tw.div`
  flex
  flex-col
  grow
  w-full
  lg:flex-row
  justify-between
  items-stretch
  gap-4
`

export const BottomArea = tw.div`
   flex
   flex-col
   gap-4
`

export const SwapSectionHeader = tw.div`
  text-xl
`

export const SwapSectionDescription = tw.div`
  text-sm
`

export const SwapSection = tw.section`
  w-full
  lg:w-[500px]
  max-w-full
  flex
  flex-col
  gap-2
`

export const SwapTokens = tw.div`
  flex
  flex-col
  gap-2
`

export const SwapDetails = tw.div`
  flex
  flex-col
  gap-1
`

export const SwapDetailItem = tw.div`
  flex
  justify-between
  items-center
  font-text
  text-sm
`

export const SwapTokenDirectionArrow = tw(Button)`
  self-center
  bg-transparent
  dark:bg-transparent
  p-2
`

export const SwapInfoSection = tw.section`
  grow
  w-full
  lg:w-auto
  flex
  items-stretch
`

export const TransfersSection = tw.section`
  
`

export const SwapRow = tw.div`
  flex
  items-stretch
  justify-between
`

export const SwapRouteDataRoot = tw.div`
  grow
  flex
  flex-col
  items-stretch
  border-t
  border-secondary-200
  dark:border-secondary-800
  pt-3
`

export const SwapRouteDataTop = tw.div`
  sticky
  top-0
  w-full
`

export const SwapRouteDataPairRoot = tw.div`
  p-2
  bg-gray-100
  dark:bg-gray-900
  block
  relative
`

export const SwapRouteDataPairGrid = tw.div`
  grid
  grid-cols-3
  p-2
`

export const SwapRouteDataPairGridItem = tw.div`
  flex
  justify-center
  items-center
  flex-col
`

export const SwapRouteDataPairSymbol = tw.div`
  text-xl
`

export const SwapRouteDataPairVolume = tw.div`
  w-full
  grow
  grid
  grid-cols-4
  text-sm
  font-text
`

export const SwapRouteDataPairVolumeItem = tw.div`
  flex
  items-center
  justify-between
  bg-gray-950
  bg-opacity-75
  p-2
`
