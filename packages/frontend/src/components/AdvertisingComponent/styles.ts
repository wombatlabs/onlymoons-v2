import tw from 'tailwind-styled-components'

export const Root = tw.div`
  flex
  flex-col
  gap-6
  p-4
`

export const TopArea = tw.div`
  flex
  flex-col
  lg:flex-row
  justify-between
  items-start
  gap-4
`

export const BottomArea = tw.div`
   flex
   flex-col
   gap-4
`

export const CreateAdSection = tw.section`
  bg-red-500
  w-full
  lg:w-[540px]
  max-w-full
`

export const AdvertisingInfoSection = tw.section`
  bg-green-500
  grow
  w-full
  lg:w-auto
`

export const AccountAdsSection = tw.section`
  bg-blue-500
`

export const TopAdsSection = tw.section`
  bg-yellow-500
`
