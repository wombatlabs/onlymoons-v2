import { FC } from 'react'
import {
  AccountAdsSection,
  AdvertisingInfoSection,
  BottomArea,
  CreateAdSection,
  Root,
  TopAdsSection,
  TopArea,
} from './styles'

export const AdvertisingComponent: FC = () => {
  return (
    <Root>
      <TopArea>
        <CreateAdSection>Create ad</CreateAdSection>
        <AdvertisingInfoSection>Info</AdvertisingInfoSection>
      </TopArea>
      <BottomArea>
        <AccountAdsSection>My ads</AccountAdsSection>
        <TopAdsSection>Top ads</TopAdsSection>
      </BottomArea>
    </Root>
  )
}
