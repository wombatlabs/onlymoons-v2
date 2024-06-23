import { forwardRef, InputHTMLAttributes } from 'react'
import { InputStyleProps, Root } from './styles'
import { Colors } from '../../types'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InputProps extends InputStyleProps, InputHTMLAttributes<HTMLInputElement> {
  //
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ $color = Colors.primary, $size = 'md', ...rest }, ref) => {
    return <Root $color={$color} $size={$size} ref={ref} {...rest} />
  },
)
