import tw from 'tailwind-styled-components'
import { Button } from '../Button'

export const Root = tw.div`
  
`

export const Trigger = tw(Button)`
  bg-transparent
  dark:bg-transparent
  lg:hidden
`

export interface OverlayStyleOptions {
  readonly $expanded?: boolean
}

export const Overlay = tw.div<OverlayStyleOptions>`
  bg-black
  bg-opacity-50
  fixed
  inset-0
  ${(p) => (p.$expanded ? 'block lg:hidden' : 'hidden')}
`

export interface ContentStyleOptions {
  readonly $expanded?: boolean
}

export const Content = tw.nav<ContentStyleOptions>`
  fixed
  left-0
  top-0
  bottom-0
  w-3/4
  lg:w-auto
  lg:static
  p-2
  lg:p-0
  bg-gray-100
  dark:bg-gray-900
  lg:bg-transparent
  lg:dark:bg-transparent
  gap-1
  items-start
  flex-col
  lg:flex-row
  ${(p) => (p.$expanded ? 'flex' : 'hidden lg:flex')}
`

export const NavItems = tw.ul`
  flex
  flex-col
  lg:flex-row
  gap-2
  items-start
  lg:items-center
  p-2
`

export const NavItem = tw.li`
  text-md
  font-light
  p-2
  lg:p-0
`
