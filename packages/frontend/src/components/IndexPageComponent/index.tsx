import { FC } from 'react'
import SupportedNetworksSection from './SupportedNetworksSection'
import HeroSection from './HeroSection'
import LockerSection from './LockerSection'

const IndexPageComponent: FC = () => {
  return (
    <div className={'flex flex-col grow'}>
      <HeroSection />
      <LockerSection />
      <SupportedNetworksSection />
    </div>
  )
}

export default IndexPageComponent
