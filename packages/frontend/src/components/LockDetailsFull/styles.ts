import tw from 'tailwind-styled-components'

export const Root = tw.div`
  p-4
`

export const TopSection = tw.div`
  flex
  flex-col
  lg:flex-row
  gap-2
`

export const LockDetails = tw.div`
  
`

export const Header = tw.div`
  flex
  items-center
  gap-2
`

export const LockDetailFields = tw.div`
  flex
  flex-col
  gap-1
  lg:max-w-md
  p-2
`

export const LockDetailField = tw.div`
  flex
  flex-col
  lg:flex-row
  lg:justify-between
  lg:items-center
`

export const LockDetailFieldLabel = tw.div`
  text-sm
  font-text
  dark:text-gray-500
`

export const LockDetailFieldValue = tw.div`
  flex
  items-center
  gap-1
`

export const LockOwner = tw.div`
  
`

export const LockNetwork = tw.div`
  text-xl
`

export const TokenName = tw.div`
  text-xl
  font-bold
`

export const TokenSymbol = tw.div`
  text-sm
  font-text
  text-gray-500
`

export const Timestamps = tw.div`
  font-text
  font-light
  text-sm
  text-gray-600
  dark:text-gray-400
`

export const Timestamp = tw.div`
  
`

export const LPDetails = tw.div`
  flex
  items-center
  gap-2
  
`

export const LockEventsStyles = tw.div`
  lg:min-w-[450px]
`

export const ManageLockArea = tw.div`
  flex
  flex-col
  gap-1
`
