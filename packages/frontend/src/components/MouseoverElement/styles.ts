import tw from 'tailwind-styled-components'
import styled from 'styled-components'

const RootCSS = styled.div``

export const Root = tw(RootCSS)`
  relative
`

export const ElementWrapper = tw.div`
  bg-primary-50
  dark:bg-primary-950
`
