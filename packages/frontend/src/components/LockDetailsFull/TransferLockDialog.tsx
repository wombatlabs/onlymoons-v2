import { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import * as Dialog from '../Dialog/styles'
import { DialogClose } from '../Dialog/DialogClose'
import { useLocale } from '../../state/stores'
import { useWeb3React } from '@web3-react/core'
import { getContractByAddress } from '../../util'
import { Contract } from '@ethersproject/contracts'
import contracts from '../../contracts/compiled_contracts.json'
import { Input } from '../Input'
import { Button } from '../Button'
import { isAddress } from 'ethers/lib/utils'
import { useLockContext } from './index'
import { RxExclamationTriangle } from 'react-icons/rx'

const {
  TokenLockerV1: { abi: TokenLockerV1ABI },
} = contracts

export interface TransferLockDialogProps {
  readonly trigger: ReactNode
}

export const TransferLockDialog: FC<TransferLockDialogProps> = ({ trigger }) => {
  const { provider } = useWeb3React()
  const { getString: s } = useLocale()
  const { lockData, updateLockData } = useLockContext()
  const [open, setOpen] = useState<boolean>(false)
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>()
  const lockContract = useMemo<Contract | undefined>(
    () =>
      provider && lockData?.contractAddress
        ? getContractByAddress(lockData.contractAddress, TokenLockerV1ABI, provider.getSigner())
        : undefined,
    [provider, lockData?.contractAddress],
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    if (!open) setNewOwnerAddress(undefined)
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.ContentInner>
            <Dialog.Titlebar>
              <Dialog.Title>{s('Transfer')}</Dialog.Title>
              <DialogClose />
            </Dialog.Titlebar>
            <div className={'p-4 flex flex-row items-center gap-3'}>
              <RxExclamationTriangle className={'w-10 h-10 p-1 text-red-500'} />
              <div>
                <div>{s('Transfers ownership of the lock to the new address.')}</div>
                <div className={'text-red-500 flex items-center gap-1'}>
                  <span>{s('This cannot be undone.')}</span>
                </div>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!isSubmitting && newOwnerAddress && lockContract) {
                  setIsSubmitting(true)
                  try {
                    const tx = await lockContract.transferOwnership(newOwnerAddress)
                    await tx.wait()
                    await updateLockData()
                    setNewOwnerAddress(undefined)
                    setOpen(false)
                  } catch (err) {
                    console.log(err)
                  }
                  setIsSubmitting(false)
                }
              }}
            >
              <div className={'flex flex-col gap-2'}>
                <Input
                  $size={'lg'}
                  size={42}
                  maxLength={42}
                  type={'text'}
                  name={'newOwner'}
                  placeholder={s('New owner address')}
                  defaultValue={newOwnerAddress}
                  onInput={(e) =>
                    setNewOwnerAddress(isAddress(e.currentTarget.value) ? e.currentTarget.value : undefined)
                  }
                />
                <Button
                  $size={'lg'}
                  type={'submit'}
                  className={'flex justify-center items-center'}
                  disabled={isSubmitting || !newOwnerAddress}
                >
                  {s('Transfer')}
                </Button>
              </div>
            </form>
          </Dialog.ContentInner>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
