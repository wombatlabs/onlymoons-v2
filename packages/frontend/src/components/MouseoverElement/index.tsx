import { CSSProperties, FC, ReactNode } from 'react'
import { ElementWrapper, Root } from './styles'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export interface MouseoverElementProps {
  label: ReactNode
  element: ReactNode
  elementWrapperStyle?: CSSProperties
}

export const MouseoverElement: FC<MouseoverElementProps> = ({ label, element, elementWrapperStyle = {} }) => {
  // const [open, setOpen] = useState<boolean>(false)

  return (
    <Root>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={'outline-none'}>{label}</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align={'start'}>
            <ElementWrapper style={elementWrapperStyle}>{element}</ElementWrapper>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </Root>
  )
}
