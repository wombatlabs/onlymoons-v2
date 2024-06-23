import { FC } from 'react'
import * as Dialog from './styles'
import { FaXmark } from 'react-icons/fa6'

export const DialogClose: FC = () => {
  return (
    <Dialog.Close>
      <FaXmark className={'w-8 h-8'} />
    </Dialog.Close>
  )
}
