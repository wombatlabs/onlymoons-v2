import { forwardRef, ButtonHTMLAttributes } from 'react'
import { ButtonStyleProps, Root } from './styles'
import { Colors } from '../../types'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ButtonProps extends ButtonStyleProps, ButtonHTMLAttributes<HTMLButtonElement> {
  //
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ $color = Colors.primary, $size = 'md', ...rest }, ref) => {
    return <Root $color={$color} $size={$size} ref={ref} {...rest} />
  },
)
