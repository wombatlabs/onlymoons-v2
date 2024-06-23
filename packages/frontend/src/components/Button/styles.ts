import tw from 'tailwind-styled-components'
import { Colors, ElemSize } from '../../types'

export interface ButtonStyleProps {
  readonly $color?: Colors
  readonly $size?: ElemSize
}

export const Root = tw.button<ButtonStyleProps>`
  text-gray-900
  dark:text-gray-100
  ${(p) => {
    switch (p.$color) {
      case Colors.primary:
        return 'bg-primary-400 dark:bg-primary-600'
      case Colors.secondary:
        return 'bg-secondary-400 dark:bg-secondary-600'
      case Colors.transparent:
        return 'bg-transparent'
      case Colors.ghost:
        return 'bg-gray-300 bg-opacity-40 dark:bg-gray-700 dark:bg-opacity-40'
      case Colors.warning:
        return 'bg-yellow-400 dark:bg-yellow-600 dark:text-gray-900'
      case Colors.danger:
        return 'bg-red-400 dark:bg-red-800'
      case Colors.success:
        return 'bg-green-400 dark:bg-green-600'
    }
  }}
  ${(p) => {
    switch (p.$size) {
      case 'sm':
        return 'px-2 py-1'
      case 'md':
        return 'px-4 py-2'
      case 'lg':
        return 'px-6 py-3'
      case 'xl':
        return 'px-8 py-4'
    }
  }}
  enabled:hover:brightness-110
  enabled:active:brightness-90
  enabled:active:translate-x-[1px]
  enabled:active:translate-y-[1px]
  disabled:opacity-75
  dark:disabled:brightness-50
  disabled:saturate-50
  disabled:m-0
  transition-all
  hover:transition-none
  flex
  items-center
`

Root.defaultProps = {
  type: 'button',
}
