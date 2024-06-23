import { FC, HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Root, TokenInfo } from './styles'
import { Colors, ExtendedTokenData } from '../../types'
import { Input } from '../Input'
import { TokenData } from '@onlymoons-io/networks'
import { TokenSelectorDropdown } from '../Dropdown/TokenSelectorDropdown'
import { HumanReadableTokenAmount } from '../HumanReadableTokenAmount'
import { getContractByAddress } from '../../util'
import { ERC20 } from '../../contracts/external_contracts.json'
import { useWeb3React } from '@web3-react/core'
import { ETH_ADDRESS } from '../../constants'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

const { abi: ERC20ABI } = ERC20

const UPDATE_BALANCE_ON_BLOCK_DELAY = 250

export interface TokenAmountInputProps extends HTMLAttributes<HTMLDivElement> {
  canSelectToken?: boolean
  setAmount?: string
  token?: TokenData
  defaultExtendedTokenData?: ExtendedTokenData
  onTokenChange?: (tokenData?: TokenData) => void
  onAmountChange?: (amount?: string) => void
}

export const TokenAmountInput: FC<TokenAmountInputProps> = ({
  canSelectToken = true,
  setAmount,
  token,
  defaultExtendedTokenData,
  onTokenChange,
  onAmountChange,
  ...rest
}) => {
  const { account, provider } = useWeb3React()
  const [extendedTokenData, setExtendedTokenData] = useState<ExtendedTokenData | undefined>(defaultExtendedTokenData)
  const [inputValue, setInputValue] = useState<string | undefined>(setAmount)
  const inputRef = useRef<HTMLInputElement>(null)
  const isQuarter = useMemo<boolean>(() => {
    if (!extendedTokenData || (!setAmount && !inputValue)) return false
    try {
      return (
        BigInt(extendedTokenData.balance.toString()) / BigInt(4) ===
        BigInt(parseUnits((setAmount ?? inputValue ?? '0').toString(), extendedTokenData.decimals).toString())
      )
    } catch (_err) {
      return false
    }
  }, [extendedTokenData?.address, inputValue, setAmount])
  const isHalf = useMemo<boolean>(() => {
    if (!extendedTokenData || (!setAmount && !inputValue)) return false
    try {
      return (
        BigInt(extendedTokenData.balance.toString()) / BigInt(2) ===
        BigInt(parseUnits((setAmount ?? inputValue ?? '0').toString(), extendedTokenData.decimals).toString())
      )
    } catch (_err) {
      return false
    }
  }, [extendedTokenData?.address, inputValue, setAmount])
  const isMax = useMemo<boolean>(() => {
    if (!extendedTokenData || (!setAmount && !inputValue)) return false
    try {
      return (
        BigInt(extendedTokenData.balance.toString()) ===
        BigInt(parseUnits((setAmount ?? inputValue ?? '0').toString(), extendedTokenData.decimals).toString())
      )
    } catch (_err) {
      return false
    }
  }, [extendedTokenData?.address, inputValue, setAmount])

  useEffect(() => {
    if (setAmount === undefined) {
      setInputValue(undefined)
    }
  }, [setAmount])

  useEffect(() => {
    onAmountChange && onAmountChange(inputValue)
  }, [inputValue])

  const updateTokenData = useCallback(() => {
    if (token && account && provider) {
      if (token.address === ETH_ADDRESS) {
        provider
          .getBalance(account)
          .then((balance) => {
            setExtendedTokenData({
              ...token,
              totalSupply: 0,
              balance,
            })
          })
          .catch((err: Error) => {
            console.log(err)
          })
      } else {
        const tokenContract = getContractByAddress(token.address, ERC20ABI, provider)
        Promise.all([
          tokenContract.totalSupply() as Promise<bigint>,
          tokenContract.balanceOf(account) as Promise<bigint>,
        ])
          .then(([totalSupply, balance]) => {
            setExtendedTokenData({
              ...token,
              totalSupply,
              balance,
            })
          })
          .catch((err: Error) => {
            console.log(err)
          })
      }
    } else {
      setExtendedTokenData(undefined)
    }
  }, [token?.address, account, provider])

  useEffect(updateTokenData, [updateTokenData])

  useEffect(() => {
    if (provider) {
      let timer: NodeJS.Timeout

      const listener = () => {
        timer && clearTimeout(timer)
        timer = setTimeout(updateTokenData, UPDATE_BALANCE_ON_BLOCK_DELAY)
      }

      const _provider = provider

      _provider.on('block', listener)

      return () => {
        _provider.off('block', listener)
        timer && clearTimeout(timer)
      }
    }
  }, [provider, updateTokenData])

  return (
    <Root {...rest}>
      <TokenInfo>
        <TokenSelectorDropdown
          canSelectToken={canSelectToken}
          defaultSelectedToken={token}
          onSelectedTokenChange={onTokenChange}
        />
        {token && extendedTokenData && (
          <div
            className={
              'flex justify-center items-center px-4 py-2 sm:px-2 text-sm font-text gap-1 bg-secondary-200 dark:bg-secondary-800'
            }
          >
            {/*<span*/}
            {/*  className={`${isTenPercent ? '' : 'opacity-50'} cursor-pointer select-none`}*/}
            {/*  onClick={() =>*/}
            {/*    setInputValue(*/}
            {/*      formatUnits(BigInt(extendedTokenData.balance.toString()) / BigInt(10), extendedTokenData.decimals),*/}
            {/*    )*/}
            {/*  }*/}
            {/*>*/}
            {/*  10%*/}
            {/*</span>*/}
            <span
              className={`${isQuarter ? '' : 'opacity-50'} cursor-pointer select-none`}
              onClick={() =>
                setInputValue(
                  formatUnits(BigInt(extendedTokenData.balance.toString()) / BigInt(4), extendedTokenData.decimals),
                )
              }
            >
              25%
            </span>
            <span
              className={`${isHalf ? '' : 'opacity-50'} cursor-pointer select-none`}
              onClick={() =>
                setInputValue(
                  formatUnits(BigInt(extendedTokenData.balance.toString()) / BigInt(2), extendedTokenData.decimals),
                )
              }
            >
              50%
            </span>
            <span
              className={`${isMax ? '' : 'opacity-50'} cursor-pointer select-none pr-1 border-r border-secondary-500`}
              onClick={() => setInputValue(formatUnits(extendedTokenData.balance, extendedTokenData.decimals))}
            >
              100%
            </span>
            <span
              className={'font-bold cursor-pointer select-none'}
              onClick={() => setInputValue(formatUnits(extendedTokenData.balance, extendedTokenData.decimals))}
            >
              <HumanReadableTokenAmount
                amount={extendedTokenData.balance}
                tokenData={extendedTokenData}
                displaySymbol={false}
                displayPercent={false}
              />
            </span>
          </div>
        )}
      </TokenInfo>

      <Input
        ref={inputRef}
        className={'grow text-xl px-4 self-stretch'}
        $size={'xl'}
        $color={Colors.transparent}
        placeholder={'0.0'}
        onInput={(e) => {
          let theValue = e.currentTarget.value.replace(/[^0-9.]/g, '')
          if (theValue.startsWith('.')) theValue = '0' + theValue
          e.currentTarget.value = theValue
          setInputValue(theValue)
        }}
        value={setAmount?.toString() ?? inputValue?.toString() ?? ''}
      />
    </Root>
  )
}
