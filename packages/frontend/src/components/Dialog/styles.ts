import tw from 'tailwind-styled-components'
import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import { motion } from 'framer-motion'

export const Root = tw(Dialog.Root)``

export const Trigger = tw(Dialog.Trigger)``

Trigger.defaultProps = {
  asChild: true,
}

export const Portal = tw(Dialog.Portal)``

export const Overlay = tw(motion(Dialog.Overlay))`
  bg-gray-200
  bg-opacity-75
  dark:bg-gray-900
  dark:bg-opacity-75
  fixed
  inset-0
  z-10
`

Overlay.defaultProps = {
  initial: { opacity: 0 },
  transition: { duration: 0.1 },
  animate: { opacity: 1 },
}

const ContentCSS = styled(Dialog.Content)`
  pointer-events: none !important;
`

export const Content = tw(ContentCSS)`
  z-20
  fixed
  inset-0
  flex
  justify-center
  items-center
  bg-black/50
`

export const ContentInner = tw(motion.div)`
  bg-gray-100
  text-gray-900
  dark:bg-gray-900
  dark:text-gray-100
  shadow-lg
  rounded
  p-3
  pointer-events-auto
  max-w-screen
  max-h-screen
  overflow-auto
  relative
`

ContentInner.defaultProps = {
  initial: {
    opacity: 0,
    top: '10px',
  },
  transition: { duration: 0.1, delay: 0.05 },
  animate: {
    opacity: 1,
    top: 0,
  },
}

export const Titlebar = tw.div`
  flex
  justify-between
  items-center
`

export const Title = tw(Dialog.Title)`
  text-xl
  font-medium
`

export const Description = tw(Dialog.Description)`
  leading-normal
  
`

export const Close = tw(Dialog.Close)`
  cursor-pointer
  flex
  justify-center
  items-center
  p-2
`

Close.defaultProps = {
  asChild: true,
}
