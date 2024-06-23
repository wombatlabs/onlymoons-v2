import tw from 'tailwind-styled-components'
import { Item } from '../styles'
import { motion } from 'framer-motion'
import { RxCaretDown } from 'react-icons/rx'

export const TokenSelectorDropdownItems = tw.div`
  overflow-auto
  max-h-full
`

export const TokenSelectorDropdownItem = tw(Item)`
  outline-none
  hover:bg-gray-200
  dark:hover:bg-gray-800
  px-4
  cursor-pointer
  select-none
  flex
  justify-between
  items-center
`

export const DropdownIcon = tw(motion(RxCaretDown))`
  
`
