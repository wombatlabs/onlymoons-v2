import tw from 'tailwind-styled-components'
import { Link } from 'react-router-dom'

export interface IListProps {
  $list?: boolean
}

export const Root = tw(Link)<IListProps>`
  relative
  block
  hover:bg-primary-100
  hover:bg-opacity-25
  hover:dark:bg-primary-900
  hover:dark:bg-opacity-25
  p-4
  ${(p) => (p.$list ? 'md:pr-14' : '')}
`

export const RootSkeleton = tw.div<IListProps>`
  relative
  block
  p-4
  ${(p) => (p.$list ? 'md:pr-14' : '')}
`

export const Content = tw.div<IListProps>`
  flex
  flex-col
  max-w-full
  ${(p) => (p.$list ? 'md:grid md:grid-cols-3 md:items-center' : 'items-start')}
`

export const Title = tw.div`
  text-xl
  font-bold
  flex
  items-center
  gap-2
  mr-7
  truncate
  max-w-full
`

export const TokenName = tw.div`
  truncate
`

export const TokenSymbol = tw.div`
  truncate
  font-extralight
  font-text
  text-sm
  text-gray-600
  dark:text-gray-400
`

export const LPInfo = tw.div`
  truncate
`

export const LPInfoPairName = tw.div`
  flex
  items-center
  gap-1.5
`

export const DataLine = tw.div`
  text-sm
  font-extralight
  font-text
  text-gray-600
  dark:text-gray-400
`

export const Timestamps = tw.div<IListProps>`
  flex
  flex-col
  ${(p) => (p.$list ? 'md:text-right' : '')}
`

export const Timestamp = tw(DataLine)`
  
`

export const Toolbar = tw.div`
  absolute
  top-0
  right-0
  bg-secondary-200
  dark:bg-secondary-800
  flex
  items-center
  gap-2
`

export const NetworkLabel = tw.div`
  px-2 py-1
`

export const LockedAmount = tw.div<IListProps>`
  
`
