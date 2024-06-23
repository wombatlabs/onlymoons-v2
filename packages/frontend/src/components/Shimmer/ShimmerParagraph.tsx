import { FC, useMemo } from 'react'
import { ShimmerText } from './ShimmerText'
import { StyledShimmerParagraph, StyledShimmerSeparator } from './styles'

const DEFAULT_WORDS =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'.split(
    ' ',
  )

function getRandomWord() {
  return DEFAULT_WORDS[Math.floor(Math.random() * DEFAULT_WORDS.length)]
}

export interface ShimmerParagraphProps {
  text?: string
  numWords?: number
}

export const ShimmerParagraph: FC<ShimmerParagraphProps> = ({ text, numWords = 50 }) => {
  const words = useMemo<string[]>(
    () => text?.split(' ') ?? new Array(numWords).fill(null).map(() => getRandomWord()),
    [text, numWords],
  )

  return (
    <StyledShimmerParagraph>
      {words.map((word, index) => (
        <span key={index}>
          <ShimmerText>{word}</ShimmerText>
          <StyledShimmerSeparator />
        </span>
      ))}
    </StyledShimmerParagraph>
  )
}
