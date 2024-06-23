import { FC } from 'react'
import { ButtonProps } from '../Button'
import { StyledShimmerButton } from './styles'

export interface ShimmerButtonProps extends ButtonProps {
  //
}

export const ShimmerButton: FC<ShimmerButtonProps> = ({ ...props }) => {
  return <StyledShimmerButton {...props} disabled={true} />
}
