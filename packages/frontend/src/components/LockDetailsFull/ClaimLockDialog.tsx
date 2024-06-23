import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import * as Dialog from '../Dialog/styles'
import { DialogClose } from '../Dialog/DialogClose'
import { useLocale } from '../../state/stores'
import { ExtendedTokenData, TokenLockData } from '../../types'
import { Button } from '../Button'
import { useLockContext } from './index'
import { Contract } from '@ethersproject/contracts'
import { formatEther, formatUnits, isAddress } from 'ethers/lib/utils'
import { getNetworkDataByChainId, NetworkData } from '@onlymoons-io/networks'
import { Input } from '../Input'
import { useWeb3React } from '@web3-react/core'
import { TokenLockerV1 } from '../../contracts/compiled_contracts.json'
import { ERC20 } from '../../contracts/external_contracts.json'
import { getContractByAddress } from '../../util'
import { useTokenCache } from '../../providers/Web3/TokenCacheProvider'
import { BigNumberish } from 'ethers'

const { abi: TokenLockerV1ABI } = TokenLockerV1
const { abi: ERC20ABI } = ERC20

export interface ClaimLockDialogProps {
  readonly trigger: ReactNode
  readonly lockData: TokenLockData
}

export const ClaimLockDialog: FC<ClaimLockDialogProps> = ({ trigger, lockData }) => {
  const { getString: s } = useLocale()
  const { provider } = useWeb3React()
  const { chainId } = useLockContext()
  const [open, setOpen] = useState<boolean>(false)
  const { getTokenData } = useTokenCache()
  const lockContract = useMemo<Contract | undefined>(
    () =>
      provider ? getContractByAddress(lockData.contractAddress, TokenLockerV1ABI, provider.getSigner()) : undefined,
    [lockData.contractAddress, provider],
  )
  const networkData = useMemo<NetworkData | undefined>(
    () => (chainId ? getNetworkDataByChainId(chainId) : undefined),
    [chainId],
  )
  const [ethBalance, setEthBalance] = useState<bigint>()
  const [checkTokenAddress, setCheckTokenAddress] = useState<string>()
  const [checkTokenData, setCheckTokenData] = useState<ExtendedTokenData>()
  const checkTokenContract = useMemo<Contract | undefined>(
    () => (checkTokenAddress && provider ? getContractByAddress(checkTokenAddress, ERC20ABI, provider) : undefined),
    [checkTokenAddress, provider],
  )
  const [checkTokenBalance, setCheckTokenBalance] = useState<bigint>()
  const [withdrawingEth, setWithdrawingEth] = useState<boolean>(false)
  const [withdrawingToken, setWithdrawingToken] = useState<boolean>(false)

  const updateEthBalance = useCallback(async () => {
    if (provider) {
      setEthBalance(undefined)
      try {
        setEthBalance(BigInt((await provider.getBalance(lockData.contractAddress)).toString()))
      } catch (err) {
        console.log(err)
        setEthBalance(undefined)
      }
    } else {
      setEthBalance(undefined)
    }
  }, [provider, lockData.contractAddress])

  useEffect(() => {
    open && updateEthBalance().catch((err) => console.log(err))
  }, [open, updateEthBalance])

  const updateTokenData = useCallback(async () => {
    if (checkTokenAddress && chainId) {
      setCheckTokenData(await getTokenData(checkTokenAddress, chainId))
    } else {
      setCheckTokenData(undefined)
    }
  }, [open, checkTokenAddress, chainId, getTokenData])

  useEffect(() => {
    open && updateTokenData().catch((err) => console.log(err))
  }, [checkTokenAddress])

  const updateTokenBalance = useCallback(async () => {
    if (checkTokenContract) {
      const balance: BigNumberish = await checkTokenContract.functions.balanceOf(lockData.contractAddress)
      setCheckTokenBalance(BigInt(balance.toString()))
    } else {
      setCheckTokenBalance(undefined)
    }
  }, [checkTokenContract])

  useEffect(() => {
    open && updateTokenBalance().catch((err) => console.log(err))
  }, [open, updateTokenBalance])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.ContentInner className={'max-w-full m-2'}>
            <Dialog.Titlebar>
              <Dialog.Title>{s('Claim')}</Dialog.Title>
              <DialogClose />
            </Dialog.Titlebar>
            {/*<Dialog.Description></Dialog.Description>*/}
            {/*<div>Claim tokens from the lock</div>*/}
            <div className={'flex flex-col gap-2'}>
              <div className={'mt-2 flex items-center justify-between gap-2'}>
                <span>
                  {networkData?.nativeCurrency.symbol ?? '--'} {s('balance')}: {formatEther(ethBalance ?? 0n)}
                </span>
                <Button
                  disabled={withdrawingEth || !lockContract || ethBalance === undefined || ethBalance === 0n}
                  onClick={async () => {
                    if (provider && lockContract) {
                      setWithdrawingEth(true)
                      try {
                        const tx = await lockContract.functions.withdrawEth()
                        await tx.wait()
                        await updateEthBalance()
                      } catch (err) {
                        console.log(err)
                      }
                      setWithdrawingEth(false)
                    }
                  }}
                >
                  {s('Claim')}
                </Button>
              </div>
              <hr className={'border-secondary-50 dark:border-secondary-950'} />
              <div className={'flex flex-col gap-1'}>
                <div>{s('Check for token balance')}</div>
                <Input
                  maxLength={42}
                  size={42}
                  $size={'lg'}
                  placeholder={s('Token address')}
                  defaultValue={checkTokenAddress}
                  onInput={(e) =>
                    setCheckTokenAddress(
                      e.currentTarget.value && isAddress(e.currentTarget.value) ? e.currentTarget.value : undefined,
                    )
                  }
                />
                {checkTokenAddress && (
                  <>
                    {checkTokenData && checkTokenBalance !== undefined ? (
                      <div className={'mt-2 flex items-center justify-between gap-2'}>
                        <span>
                          {checkTokenData.symbol} balance:{' '}
                          <span>{formatUnits(checkTokenBalance, checkTokenData.decimals)}</span>
                        </span>
                        <Button
                          disabled={withdrawingToken || !lockContract || !checkTokenBalance || !checkTokenAddress}
                          onClick={async () => {
                            if (checkTokenAddress && provider && lockContract) {
                              setWithdrawingToken(true)
                              try {
                                const tx = await lockContract.functions.withdrawToken(checkTokenAddress)
                                await tx.wait()
                                await updateTokenBalance()
                              } catch (err) {
                                console.log(err)
                              }
                              setWithdrawingToken(false)
                            }
                          }}
                        >
                          {s('Claim')}
                        </Button>
                      </div>
                    ) : (
                      <>Loading...</>
                    )}
                  </>
                )}
              </div>
            </div>
          </Dialog.ContentInner>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
