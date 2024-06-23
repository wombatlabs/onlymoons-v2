import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import * as Dialog from '../Dialog/styles'
import { DialogClose } from '../Dialog/DialogClose'
import { useLocale } from '../../state/stores'
import { ApprovalState, Colors, TokenLockData } from '../../types'
import { FormRow } from '../CreateLockComponent/styles'
import { TokenAmountInput } from '../TokenAmountInput'
import { parseUnits } from 'ethers/lib/utils'
import { Input } from '../Input'
import { useLockContext } from './index'
import { Button } from '../Button'
import { getContractByAddress, timestampToDateTimeLocal } from '../../util'
import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { TokenLockerV1 } from '../../contracts/compiled_contracts.json'
import { ERC20 } from '../../contracts/external_contracts.json'

const { abi: TokenLockerV1ABI } = TokenLockerV1
const { abi: ERC20ABI } = ERC20

export interface ExtendLockDialogProps {
  readonly trigger: ReactNode
  readonly lockData: TokenLockData
}

export const ExtendLockDialog: FC<ExtendLockDialogProps> = ({ trigger, lockData }) => {
  const { account, provider } = useWeb3React()
  const { getString: s } = useLocale()
  const { lockedTokenData: tokenData, updateLockData } = useLockContext()
  const [open, setOpen] = useState<boolean>(false)
  const [tokenAmount, setTokenAmount] = useState<bigint>()
  const [unlockTime, setUnlockTime] = useState<number | undefined>(lockData.unlockTime)
  const formIsValid = useMemo<boolean>(() => (unlockTime ?? 0) > Date.now() / 1000, [unlockTime])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const lockedTokenContract = useMemo<Contract | undefined>(
    () => (provider ? getContractByAddress(lockData.token, ERC20ABI, provider.getSigner()) : undefined),
    [provider, lockData.token],
  )
  const lockContract = useMemo<Contract | undefined>(
    () =>
      provider ? getContractByAddress(lockData.contractAddress, TokenLockerV1ABI, provider.getSigner()) : undefined,
    [provider, lockData.contractAddress],
  )
  const [approvalState, setApprovalState] = useState<ApprovalState>('unapproved')

  useEffect(() => {
    if (open) {
      setUnlockTime(lockData.unlockTime)
    } else {
      setUnlockTime(undefined)
    }
    setTokenAmount(undefined)
  }, [lockData, open])

  const updateApprovalState = useCallback(async () => {
    if (account) {
      if ((tokenAmount ?? 0n) > 0n) {
        // we're depositing tokens, so we need to check approval
        if (lockedTokenContract) {
          const allowance: bigint = BigInt(
            (await lockedTokenContract.allowance(account, lockData.contractAddress)).toString(),
          )
          // console.log(`allowance: ${allowance}`)
          if (allowance >= (tokenAmount ?? 0n)) {
            setApprovalState('approved')
          } else {
            setApprovalState('unapproved')
          }
        } else {
          // lockedTokenContract isn't defined. something went wrong
          setApprovalState('unapproved')
        }
      } else {
        // if we're not depositing an amount, we don't need approval
        setApprovalState('approved')
      }
    } else {
      // no account? :(
      setApprovalState('unapproved')
    }
  }, [account, tokenAmount, lockedTokenContract, lockData.contractAddress])

  useEffect(() => {
    updateApprovalState().catch((err) => {
      console.log(err)
    })
  }, [updateApprovalState])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.ContentInner className={'w-[500px] max-w-full m-2'}>
            <Dialog.Titlebar>
              <Dialog.Title>
                {s('Deposit')} / {s('Extend')}
              </Dialog.Title>
              <DialogClose />
            </Dialog.Titlebar>
            {/*<Dialog.Description></Dialog.Description>*/}
            {tokenData && (
              <form
                className={'flex flex-col gap-2'}
                onSubmit={async (e) => {
                  e.preventDefault()
                  console.log('approvalState:', approvalState)
                  let tx
                  switch (approvalState) {
                    case 'approved':
                      if (lockContract) {
                        setIsSubmitting(true)
                        try {
                          tx = await lockContract.functions.deposit(tokenAmount, unlockTime)
                          await tx.wait()
                          updateLockData().catch(console.log)
                          setOpen(false)
                        } catch (err) {
                          console.log(err)
                        }
                        setIsSubmitting(false)
                      } else {
                        // lockContract is undefined...
                        console.log('lockContract is undefined')
                      }
                      break
                    case 'unapproved':
                      console.log('unapproved')
                      if (lockedTokenContract) {
                        setApprovalState('approving')
                        try {
                          console.log(`approving ${lockData.contractAddress} for ${tokenAmount}`)
                          tx = await lockedTokenContract.functions.approve(lockData.contractAddress, tokenAmount)
                          await tx.wait()
                        } catch (err) {
                          console.log(err)
                        }
                        await updateApprovalState()
                      } else {
                        console.log('lockedTokenContract is undefined')
                      }
                      break
                  }
                }}
              >
                <FormRow className={'mt-4'}>
                  <TokenAmountInput
                    canSelectToken={false}
                    token={tokenData}
                    defaultExtendedTokenData={tokenData}
                    onAmountChange={(amount) =>
                      setTokenAmount(BigInt(amount ? parseUnits(amount, tokenData.decimals).toString() : 0))
                    }
                  />
                </FormRow>
                <FormRow>
                  <Input
                    type={'datetime-local'}
                    $size={'xl'}
                    defaultValue={timestampToDateTimeLocal(lockData.unlockTime * 1000)}
                    onChange={(e) => {
                      if (e.currentTarget.value && e.currentTarget.value !== '') {
                        setUnlockTime(Math.floor(new Date(e.currentTarget.value).getTime() / 1000))
                      } else {
                        setUnlockTime(undefined)
                      }
                    }}
                  />
                </FormRow>
                <FormRow>
                  <Button
                    $size={'lg'}
                    $color={formIsValid ? Colors.primary : Colors.danger}
                    type={'submit'}
                    className={'flex gap-2 items-center justify-center'}
                    disabled={!formIsValid || isSubmitting || approvalState === 'approving'}
                  >
                    {isSubmitting
                      ? s('Updating...')
                      : formIsValid
                      ? approvalState === 'approved'
                        ? s('Update')
                        : approvalState === 'approving'
                        ? s('Approving...')
                        : s('Approve')
                      : s('Unlock time must be a future time')}
                  </Button>
                </FormRow>
              </form>
            )}
          </Dialog.ContentInner>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
