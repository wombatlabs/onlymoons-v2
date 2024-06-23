import tw from 'tailwind-styled-components'

export const Overlay = tw.div`
  p-2
  overflow-hidden
  overflow-y-auto
  max-h-[65vh]
`

export const CountList = tw.ul`
  max-w-full
  truncate
`

export const CountListItem = tw.li`
  whitespace-nowrap
  flex
  flex-row
  justify-between
  items-center
  gap-4
`

export const CountListNetwork = tw.div`
  grow
  truncate
`

export const CountListIndex = tw.span`
  opacity-40
  font-mono
  text-xs
`

export const NetworkName = tw.span`
  font-light
  truncate
  max-w-full
`

export const LockCount = tw.span`
  font-bold
  font-mono
  shrink-0
`
