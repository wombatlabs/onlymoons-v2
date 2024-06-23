import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Form, FormRow, NoToken, Root, TokenName } from './styles'
import { useLocale } from '../../state/stores'
import { Input } from '../Input'
import { isAddress, parseUnits } from 'ethers/lib/utils'
import { useTokenCache } from '../../providers/Web3/TokenCacheProvider'
import { ApprovalState, ExtendedTokenData, LPData } from '../../types'
import { useWeb3React } from '@web3-react/core'
import { useUtilContract } from '../../providers/Web3/UtilContractProvider'
import { TokenAmountInput } from '../TokenAmountInput'
import { LPInfo } from '../LockDetailsQuick/LPInfo'
import { Button } from '../Button'
import { Contract } from '@ethersproject/contracts'
import { ERC20 } from '../../contracts/external_contracts.json'
import { BigNumberish } from 'ethers'
import { getContractByAddress, getContractByName } from '../../util'
import { useNavigate } from 'react-router-dom'
import { getNetworkDataByChainId } from '@onlymoons-io/networks'

const { abi: ERC20ABI } = ERC20

export const CreateLockComponent: FC = () => {
  const { account, chainId, provider } = useWeb3React()
  const { getString: s } = useLocale()
  const navigate = useNavigate()
  const [tokenAddress, setTokenAddress] = useState<string>('')
  const { getLiveTokenData: getTokenData } = useTokenCache()
  const lockerManager = useMemo<Contract | undefined>(
    () => (chainId && provider ? getContractByName('TokenLockerManagerV1', chainId, provider.getSigner()) : undefined),
    [chainId, provider],
  )
  const { [chainId ?? 0]: utils } = useUtilContract()
  const [tokenData, setTokenData] = useState<ExtendedTokenData>()
  const [isLpToken, setIsLpToken] = useState<boolean>()
  const [lpData, setLpData] = useState<LPData>()
  const [tokenAmount, setTokenAmount] = useState<bigint>(BigInt(0))
  const tokenContract = useMemo<Contract | undefined>(
    () => (tokenAddress && provider ? getContractByAddress(tokenAddress, ERC20ABI, provider.getSigner()) : undefined),
    [tokenAddress, provider],
  )
  const [unlockTime, setUnlockTime] = useState<number>()
  const [approvalState, setApprovalState] = useState<ApprovalState>('unapproved')
  const [isCreatingLock, setIsCreatingLock] = useState<boolean>(false)

  useEffect(() => {
    if (utils && tokenAddress) {
      setIsLpToken(undefined)
      utils
        .getLpData(tokenAddress)
        .then((response) => {
          setLpData(response)
          setIsLpToken(!!response)
        })
        .catch((err) => {
          console.log(err)
          setIsLpToken(false)
          setLpData(undefined)
        })
    } else {
      setIsLpToken(undefined)
      setLpData(undefined)
    }
  }, [utils, tokenAddress])

  useEffect(() => {
    if (chainId && isAddress(tokenAddress)) {
      getTokenData(tokenAddress, chainId)
        .then(setTokenData)
        .catch((err) => {
          console.log(err)
          setTokenData(undefined)
        })
    } else {
      setTokenData(undefined)
    }
  }, [tokenAddress, chainId])

  const updateApprovalState = useCallback(() => {
    if (account && lockerManager && tokenContract && tokenAmount !== undefined) {
      tokenContract
        .allowance(account, lockerManager.address)
        .then((allowance: BigNumberish) => {
          const biAllowance = BigInt(allowance.toString())
          if (tokenAmount <= biAllowance) {
            setApprovalState('approved')
          } else {
            setApprovalState('unapproved')
          }
        })
        .catch((err: Error) => {
          console.log(err)
          setApprovalState('unapproved')
        })
    } else {
      setApprovalState('unapproved')
    }
  }, [account, lockerManager, tokenContract, tokenAmount])

  useEffect(updateApprovalState, [updateApprovalState])

  return (
    <Root>
      <Form>
        <FormRow>
          <Input
            $size={'xl'}
            maxLength={42}
            size={42}
            defaultValue={tokenAddress}
            placeholder={s('Address')}
            autoFocus={true}
            onInput={(e) => setTokenAddress(e.currentTarget.value)}
          />
        </FormRow>

        {tokenData && isLpToken !== undefined ? (
          <>
            <FormRow>
              <TokenName>
                {tokenData.name} ({tokenData.symbol})
              </TokenName>
              {chainId && lpData && (
                <div className={'self-center'}>
                  <LPInfo chainId={chainId} tokenData={tokenData} />
                </div>
              )}
            </FormRow>
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
                $size={'xl'}
                className={'flex gap-2 items-center justify-center'}
                disabled={
                  !tokenData ||
                  !lockerManager ||
                  !tokenContract ||
                  !unlockTime ||
                  approvalState === 'approving' ||
                  isCreatingLock
                }
                onClick={async () => {
                  if (!chainId) return console.log('no chain id!')
                  if (!lockerManager) return console.log('lockerManager is not ready :(')
                  if (!tokenContract) return console.log('tokenContract is not ready :(')
                  switch (approvalState) {
                    case 'unapproved':
                    default:
                      setApprovalState('approving')
                      try {
                        const tx = await tokenContract.functions.approve(lockerManager.address, tokenAmount)
                        await tx.wait()
                      } catch (err) {
                        console.log(err)
                      }
                      updateApprovalState()
                      break
                    case 'approving':
                      break
                    case 'approved':
                      setIsCreatingLock(true)
                      try {
                        const tx = await lockerManager.functions.createTokenLocker(
                          tokenAddress,
                          tokenAmount,
                          unlockTime,
                        )
                        const result = await tx.wait()
                        console.log('tx response', result)
                        const tokenLockerCreatedEvent = result.events.find(
                          ({ event }: { event: string }) => event === 'TokenLockerCreated',
                        )
                        const {
                          args: { id },
                        }: { args: { id: number } } = tokenLockerCreatedEvent
                        const networkData = getNetworkDataByChainId(chainId)
                        if (networkData) {
                          navigate(`/locker/${networkData.urlName}/${id}`)
                        }
                      } catch (err) {
                        console.log(err)
                        setIsCreatingLock(false)
                      }
                      break
                  }
                }}
              >
                {approvalState === 'unapproved'
                  ? s('Approve')
                  : approvalState === 'approving'
                  ? s('Approving...')
                  : s('Create lock')}
              </Button>
            </FormRow>
          </>
        ) : (
          <NoToken>
            {tokenAddress
              ? isAddress(tokenAddress)
                ? s('Loading...')
                : s('Invalid address')
              : s('Enter a token address to lock')}
          </NoToken>
        )}
      </Form>
    </Root>
  )
}
