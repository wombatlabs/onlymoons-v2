import { FC } from 'react'
import { ShimmerText } from '../Shimmer/ShimmerText'
import { LPIcon } from './LPIcon'
import { LPInfoPairName } from './styles'

export const LPInfoSkeleton: FC = () => {
  return (
    <LPInfoPairName>
      <ShimmerText className={'text-lg'}>ABC</ShimmerText>
      <LPIcon />
      <ShimmerText className={'text-lg'}>ABCD</ShimmerText>
    </LPInfoPairName>
  )
}
