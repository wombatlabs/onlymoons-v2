import { FC, HTMLAttributes, Key, ReactNode } from 'react'
import { GridLayoutStyleProps, Item, Root } from './styles'

export interface GridLayoutProps extends HTMLAttributes<HTMLDivElement>, GridLayoutStyleProps {
  readonly items?: Array<{ key?: Key | null; item: ReactNode }>
}

export const GridLayout: FC<GridLayoutProps> = ({ items, $list = false, ...rest }) => {
  return (
    <Root $list={$list} {...rest}>
      {items?.map(({ key, item }, index) => (
        <Item key={key ?? index}>{item}</Item>
      ))}
    </Root>
  )
}
