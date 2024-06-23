import tw from 'tailwind-styled-components'

export interface GridLayoutStyleProps {
  $list?: boolean
}

export const Root = tw.div<GridLayoutStyleProps>`
  grid
  grid-cols-1
  ${(p) => (p.$list ? 'gap-8 md:gap-0' : 'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8')}
`

export const Item = tw.div`
  border-t
  border-secondary-200
  dark:border-secondary-800
`
