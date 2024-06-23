import tw from 'tailwind-styled-components'
import { Colors, ElemSize } from '../../types'

export interface InputStyleProps {
  readonly $color?: Colors
  readonly $size?: ElemSize
}

export const Root = tw.input<InputStyleProps>`
  text-gray-900
  dark:text-gray-100
  font-mono
  border
  border-transparent
  ${(p) => {
    switch (p.$color) {
      case Colors.primary:
        return 'bg-gray-100 dark:bg-gray-900 focus:border-primary-800'
      case Colors.secondary:
        return 'bg-gray-100 dark:bg-gray-900 focus:border-secondary-800'
      case Colors.transparent:
        return 'bg-transparent'
      case Colors.ghost:
        return 'bg-gray-300 bg-opacity-40 dark:bg-gray-700 dark:bg-opacity-40'
      case Colors.warning:
        return 'bg-yellow-500 dark:bg-yellow-500 dark:text-gray-900'
      case Colors.danger:
        return 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700'
    }
  }}
  ${(p) => {
    switch (p.$size) {
      case 'sm':
        return 'px-2 py-1 text-sm'
      case 'md':
        return 'px-3 py-1.5 text-md'
      case 'lg':
        return 'px-4 py-2 text-lg'
      case 'xl':
        return 'px-4 py-4 text-lg'
    }
  }}
  disabled:brightness-50
  disabled:saturate-50
  disabled:m-0
  transition-all
  flex
  items-center
  outline-none
`

Root.defaultProps = {
  type: 'text',
}
