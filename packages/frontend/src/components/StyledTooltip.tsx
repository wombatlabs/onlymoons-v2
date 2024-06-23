import { FC, ReactNode } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import tw from 'tailwind-styled-components'

const StyledTooltipContent = tw(Tooltip.Content)`
  bg-white
  shadow
  text-gray-900
  dark:bg-gray-800
  dark:text-gray-100
  p-3
  rounded
`

export interface StyledTooltipProps {
  children?: ReactNode
  trigger: ReactNode
}

export const StyledTooltip: FC<StyledTooltipProps> = ({ children, trigger }) => {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger>{trigger}</Tooltip.Trigger>
      <Tooltip.Portal>
        <StyledTooltipContent>{children}</StyledTooltipContent>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
