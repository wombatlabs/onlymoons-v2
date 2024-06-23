import tw from 'tailwind-styled-components'

export const Root = tw.div`
  flex
  flex-col
  lg:flex-row
  lg:items-center
  justify-between
  gap-1
`

export const LeftSide = tw.div`
  flex
  gap-2
  items-baseline
`

export const PageTitle = tw.div`
  text-3xl
`

export const RightSide = tw.div`
  flex
  flex-col
  lg:flex-row
  items-stretch
  lg:items-center
  gap-2
`

export const LockButtons = tw.div`
  flex
  items-center
  gap-2
`
