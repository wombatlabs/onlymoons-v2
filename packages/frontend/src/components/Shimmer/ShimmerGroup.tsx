import { FC } from 'react'
import { ShimmerButton } from './ShimmerButton'
import { ShimmerAvatar } from './ShimmerAvatar'
import { ShimmerText } from './ShimmerText'
import { ShimmerParagraph } from './ShimmerParagraph'
import { LockDetailsQuickSkeleton } from '../LockDetailsQuick/LockDetailsQuickSkeleton'

export const ShimmerGroup: FC = () => {
  return (
    <div>
      <ShimmerAvatar />
      <ShimmerButton>Button</ShimmerButton>
      <div className={'flex flex-col gap-2 items-start'}>
        <ShimmerText />
        <ShimmerText />
        <ShimmerText />
      </div>
      <ShimmerParagraph />
      <br />
      Lock details:
      <br />
      <br />
      <LockDetailsQuickSkeleton />
    </div>
  )
}
