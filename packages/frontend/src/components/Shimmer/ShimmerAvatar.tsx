import { FC, HTMLAttributes } from 'react'
import { StyledShimmerAvatar } from './styles'

export interface ShimmerAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  //
}

export const ShimmerAvatar: FC<ShimmerAvatarProps> = ({ ...rest }) => {
  return <StyledShimmerAvatar {...rest} />
}
