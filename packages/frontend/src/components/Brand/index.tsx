import { FC } from 'react'
import { Root, Logo, LogoImg, Text } from './styles'

export const Brand: FC = () => {
  return (
    <Root>
      <Logo>
        <LogoImg className="-m-2" />
      </Logo>
      <Text className="text-2xl">
        <span>Only</span>
        <span className="ml-[2px] font-bold">Moons</span>
      </Text>
    </Root>
  )
}
