import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import logo from '../../assets/logo-white.svg'

const RootCSS = styled.span``

export const Root = tw(RootCSS)`
  flex
  items-center
  gap-1
`

export const Text = styled.span`
  font-family: 'Red Hat Mono', source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  text-transform: uppercase;
`

const LogoCSS = styled.div`
  ${RootCSS}:hover & {
    transform: rotate(280deg) scale(1.2);
  }
`

export const Logo = tw(LogoCSS)`
  transition-all
  duration-300
  flex
  justify-center
  items-center
  bg-primary-500
  rounded-full
  w-8
  h-8
  m-1
`

export const LogoImgCSS = styled.img`
  transform: scale(1.5);

  ${RootCSS}:hover & {
    transform: scale(1.6);
  }
`

LogoImgCSS.defaultProps = {
  src: logo,
}

export const LogoImg = tw(LogoImgCSS)`
  
`
