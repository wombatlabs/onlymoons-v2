import { FC, useMemo, useState } from 'react'
import { Colors } from '../../types'
import { HumanReadableTokenAmount } from '../HumanReadableTokenAmount'
import { Button } from '../Button'
import { useLocale } from '../../state/stores'
import { useLockContext } from './index'
import { TokenLockerV1 } from '../../contracts/compiled_contracts.json'
import { Contract } from '@ethersproject/contracts'
import { getContractByAddress } from '../../util'
import { useWeb3React } from '@web3-react/core'

const { abi: TokenLockerV1ABI } = TokenLockerV1

export const WithdrawLockButton: FC = () => {
  const { getString: s } = useLocale()
  const { provider } = useWeb3React()
  const { lockData, lockedTokenData, updateLockData } = useLockContext()
  const lockContract = useMemo<Contract | undefined>(
    () =>
      lockData && provider
        ? getContractByAddress(lockData.contractAddress, TokenLockerV1ABI, provider.getSigner())
        : undefined,
    [],
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  return lockData ? (
    <Button
      $color={Colors.ghost}
      className={'grow flex justify-center items-center'}
      disabled={isSubmitting}
      onClick={async () => {
        if (lockContract) {
          setIsSubmitting(true)
          try {
            const tx = await lockContract.functions.withdraw()
            await tx.wait()
            await updateLockData()
          } catch (err) {
            console.log(err)
          }
          setIsSubmitting(false)
        }
      }}
    >
      {s('Withdraw')}
      {lockedTokenData && (
        <>
          {' '}
          <HumanReadableTokenAmount amount={lockData.balance} tokenData={lockedTokenData} displayPercent={false} />
        </>
      )}
    </Button>
  ) : (
    <>No lock data</>
  )
}
