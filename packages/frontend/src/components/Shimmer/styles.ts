import tw from 'tailwind-styled-components'
import { Button } from '../Button'

// bg-gray-100
// dark:bg-gray-900

const shimmerClasses = `
  bg-gray-200/70
  dark:bg-gray-900
  text-transparent
  dark:text-transparent
  select-none
  relative
  isolate
  overflow-hidden
  before:-translate-x-full
  before:absolute
  before:inset-0
  before:bg-gradient-to-r
  before:from-transparent
  before:via-gray-50
  dark:before:via-gray-700/50
  before:to-transparent
  before:animate-shimmer
`

export const StyledShimmerButton = tw(Button)`
  ${() => shimmerClasses}
  scale-y-[0.5]
  disabled:brightness-100
`

export const StyledShimmerAvatar = tw.span`
  ${() => shimmerClasses}
  inline-block
  w-12
  h-12
  rounded-full
`

export const StyledShimmerText = tw.span`
  ${() => shimmerClasses}
  px-1
  rounded
  scale-y-[0.5]
  overflow-hidden
  inline-flex
`

export const StyledShimmerSeparator = tw.span`
  
`

StyledShimmerSeparator.defaultProps = {
  children: ' ',
}

export const StyledShimmerParagraph = tw.p`
  select-none
`
