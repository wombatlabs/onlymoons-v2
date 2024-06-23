import { FC, HTMLAttributes, Key, ReactNode } from 'react'
import { Item, Root } from './styles'

export interface CompactListLayoutProps extends HTMLAttributes<HTMLUListElement> {
  readonly items?: Array<{ key?: Key | null; item: ReactNode }>
}

export const CompactListLayout: FC<CompactListLayoutProps> = ({ items, ...props }) => {
  return (
    <Root {...props}>
      {items?.map(({ key, item }, index) => (
        <Item key={key ?? index}>{item}</Item>
      ))}
    </Root>
  )
}
