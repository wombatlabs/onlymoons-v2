import { FC } from 'react'
import { ManageLockArea } from './styles'
import { Button } from '../Button'
import { Colors } from '../../types'
import { ExtendLockDialog } from './ExtendLockDialog'
import { TransferLockDialog } from './TransferLockDialog'
import { ClaimLockDialog } from './ClaimLockDialog'
import { useLockContext } from './index'
import { useLocale } from '../../state/stores'
import { WithdrawLockButton } from './WithdrawLockButton'
import { useWeb3React } from '@web3-react/core'
import { getNetworkDataByChainId } from '@onlymoons-io/networks'

export const ManageLock: FC = () => {
  const { chainId } = useWeb3React()
  const { getString: s } = useLocale()
  const { chainId: lockChainId, lockData, lockState } = useLockContext()

  return chainId && chainId === lockChainId ? (
    lockData ? (
      <ManageLockArea>
        <ExtendLockDialog
          trigger={
            <Button $color={Colors.ghost} className={'flex justify-center items-center'}>
              {s('Deposit / Extend')}
            </Button>
          }
          lockData={lockData}
        />
        {lockState === 'unlocked' && <WithdrawLockButton />}
        <ClaimLockDialog
          trigger={
            <Button $color={Colors.ghost} className={'grow flex justify-center items-center'}>
              {s('Claim / Recover')}
            </Button>
          }
          lockData={lockData}
        />
        <TransferLockDialog
          trigger={
            <Button $color={Colors.ghost} className={'flex justify-center items-center'}>
              {s('Transfer ownership')}
            </Button>
          }
        />
      </ManageLockArea>
    ) : (
      <>{s('No lock data...')}</>
    )
  ) : (
    <div className={'flex justify-center items-center text-sm font-text'}>
      {/* TODO use locale getString here,
            but it needs some sort of text
            formatting like %d for chainId */}
      Connect to {getNetworkDataByChainId(lockChainId ?? 0)?.name ?? `(chainId: ${lockChainId})`} to manage this lock
    </div>
  )
}
