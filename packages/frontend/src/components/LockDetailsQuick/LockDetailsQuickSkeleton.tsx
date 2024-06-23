import { FC, HTMLAttributes } from 'react'
import { ShimmerText } from '../Shimmer/ShimmerText'
import { ShimmerParagraph } from '../Shimmer/ShimmerParagraph'
import {
  RootSkeleton,
  LockedAmount,
  NetworkLabel,
  Timestamp,
  Timestamps,
  Title,
  TokenName,
  TokenSymbol,
  Toolbar,
  Content,
} from './styles'
import { ShimmerAvatar } from '../Shimmer/ShimmerAvatar'
import { useLockerFiltersState } from '../LockerFilters'

export interface LockDetailsQuickSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  disableListView?: boolean
}

export const LockDetailsQuickSkeleton: FC<LockDetailsQuickSkeletonProps> = ({ disableListView = false, ...props }) => {
  const { displayAsList: displayAsListFromState } = useLockerFiltersState()
  const displayAsList = disableListView ? false : displayAsListFromState

  return (
    <RootSkeleton $list={displayAsList} {...props}>
      <Toolbar>
        {/* we need to override padding to keep things happy */}
        <NetworkLabel className={'px-2 pt-1 pb-0'}>
          <ShimmerAvatar style={{ width: 20, height: 20 }} />
        </NetworkLabel>
      </Toolbar>
      <Content $list={displayAsList}>
        <Title>
          <TokenName>
            <ShimmerText>TokenName</ShimmerText>
          </TokenName>
          <TokenSymbol>
            <ShimmerText>SYM</ShimmerText>
          </TokenSymbol>
        </Title>
        <LockedAmount $list={displayAsList}>
          <ShimmerParagraph text={'315.5008462 SYM (18.13%)'} />
        </LockedAmount>
        <Timestamps $list={displayAsList}>
          <Timestamp>
            <ShimmerParagraph text={'Created 3 hours ago'} />
          </Timestamp>
          <Timestamp>
            <ShimmerParagraph text={'Unlocks in 5 months'} />
          </Timestamp>
        </Timestamps>
      </Content>
    </RootSkeleton>
  )
}
