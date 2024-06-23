import tw from 'tailwind-styled-components'
import { RxSymbol } from 'react-icons/rx'

export interface LoadingSpinnerProps {
  $loading?: boolean
}

export const LoadingSpinner = tw(RxSymbol)<LoadingSpinnerProps>`
  ${(p) => (p.$loading ? 'animate-spin' : 'opacity-0')}
`
