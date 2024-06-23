import tw from 'tailwind-styled-components'
import { Button } from '../../Button'

export const WalletTypeList = tw.div`
  flex
  flex-col
  items-stretch
  relative
  bg-black
  rounded
  overflow-hidden
`

export const WalletTypeListItem = tw(Button)`
  bg-white
  dark:bg-black
  hover:bg-primary-300
  hover:dark:bg-primary-700
  flex
  items-center
  justify-center
  p-4
`

export const Overlay = tw.div`
  absolute
  inset-0
  bg-white
  bg-opacity-80
  dark:bg-black
  dark:bg-opacity-80
  flex
  justify-center
  items-center
`
