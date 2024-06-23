import tw from 'tailwind-styled-components'
import { StyledLinkStyle } from '../types'
import { Link } from 'react-router-dom'

export interface StyledLinkStyleProps {
  $linkStyle?: StyledLinkStyle
}

export const StyledLink = tw(Link)<StyledLinkStyleProps>`
  hover:underline
  ${(p) => {
    switch (p.$linkStyle) {
      case 'primary':
        return 'text-primary-500'
      case 'secondary':
        return 'text-secondary-500'
      case 'danger':
        return 'text-red-500'
      case 'warn':
        return 'text-yellow-400'
      case 'info':
        return 'text-cyan-500'
      case 'none':
        return ''
      default:
        return 'font-bold'
    }
  }}
`
