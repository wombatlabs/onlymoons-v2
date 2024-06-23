import tw from 'tailwind-styled-components'
import { StyledLinkStyle } from '../types'

export interface StyledAnchorStyleProps {
  $linkStyle?: StyledLinkStyle
}

export const StyledAnchor = tw.a<StyledAnchorStyleProps>`
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

// default to an external link, since internally we use `Link` instead
StyledAnchor.defaultProps = {
  target: '_blank',
  rel: 'no-opener no-referrer',
}
