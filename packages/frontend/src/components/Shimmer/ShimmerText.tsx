import { FC, HTMLAttributes, ReactNode, useMemo, useRef } from 'react'
import { StyledShimmerText } from './styles'

export interface ShimmerTextProps extends HTMLAttributes<HTMLSpanElement> {
  chars?: {
    min: number
    max: number
  }
}

export const ShimmerText: FC<ShimmerTextProps> = ({
  children,
  chars: { min: minChars, max: maxChars } = { min: 15, max: 30 },
  ...rest
}) => {
  // generate a random value and preserve it through state changes
  const { current: rand } = useRef<number>(Math.random())
  const theChildren = useMemo<ReactNode>(
    () =>
      children ??
      new Array(Math.ceil(minChars + rand * (maxChars - minChars)))
        .fill(null)
        // get random characters so they might be different width
        .map(() => rand.toString(36).substring(2, 5).charAt(0))
        .join(''),
    [children, minChars, maxChars],
  )
  // @ts-ignore
  return <StyledShimmerText {...rest}>{theChildren}</StyledShimmerText>
}
