import tw from 'tailwind-styled-components'
import { motion } from 'framer-motion'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export const Root = tw(DropdownMenu.Root)`
  
`

export const Trigger = tw(DropdownMenu.Trigger)``

export const Portal = tw(DropdownMenu.Portal)``

export const Content = tw(motion(DropdownMenu.Content))`
  bg-white
  dark:bg-gray-900
`

Content.defaultProps = {
  initial: {
    opacity: 0,
    y: -8,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  transition: {
    duration: 0.15,
  },
}

export const Arrow = tw(DropdownMenu.Arrow)``

export const Item = tw(DropdownMenu.Item)`
  p-2
`

export const Group = tw(DropdownMenu.Group)``

export const Label = tw(DropdownMenu.Label)`
  p-2
`

export const CheckboxItem = tw(DropdownMenu.CheckboxItem)``

export const RadioGroup = tw(DropdownMenu.RadioGroup)``

export const RadioItem = tw(DropdownMenu.RadioItem)``

export const ItemIndicator = tw(DropdownMenu.ItemIndicator)``

export const Separator = tw(DropdownMenu.Separator)``

export const Sub = tw(DropdownMenu.Sub)``

export const SubTrigger = tw(DropdownMenu.SubTrigger)``

export const SubContent = tw(DropdownMenu.SubContent)``
