import { FC, useEffect, useMemo, useState } from 'react'
import { Content, Label, Portal, Root, Trigger } from '../styles'
import { Colors, ExtendedTokenData } from '../../../types'
import { useLocale } from '../../../state/stores'
import { getNetworkDataByChainId, NetworkData, TokenData } from '@onlymoons-io/networks'
import { DropdownIcon, TokenSelectorDropdownItem, TokenSelectorDropdownItems } from './styles'
import { Input } from '../../Input'
import { useTokenCache } from '../../../providers/Web3/TokenCacheProvider'
import { useWeb3React } from '@web3-react/core'
import { HumanReadableTokenAmount } from '../../HumanReadableTokenAmount'
import { ERC20 } from '../../../contracts/external_contracts.json'
import { getContractByAddress } from '../../../util'
import { BigNumberish } from 'ethers'
import { formatUnits, isAddress } from 'ethers/lib/utils'
import { ETH_ADDRESS } from '../../../constants'
import { useSwapTokens } from '../../../state/stores/swapTokens'
import { Contract } from '@ethersproject/contracts'
import { Button } from '../../Button'
import { tokenPresets } from '../../../data/token-presets'
import { RxMinus, RxPlus } from 'react-icons/rx'

const { abi: ERC20ABI } = ERC20

export interface TokenSelectorDropdownProps {
  defaultSelectedToken?: TokenData
  canSelectToken?: boolean
  onSelectedTokenChange?: (tokenData?: TokenData) => void
}

export const TokenSelectorDropdown: FC<TokenSelectorDropdownProps> = ({
  defaultSelectedToken,
  canSelectToken = true,
  onSelectedTokenChange,
}) => {
  const { getString: s } = useLocale()
  const { tokens: swapTokens, addToken, removeToken, reset: resetSwapTokens } = useSwapTokens()
  const { chainId, provider, account } = useWeb3React()
  const [connectedNetwork, setConnectedNetwork] = useState<NetworkData>()
  const { getTokenData } = useTokenCache()
  const [selectedToken, setSelectedToken] = useState<TokenData | undefined>(defaultSelectedToken)
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const tokenPresetList = useMemo<Array<string>>(() => {
    if (!chainId) return []
    return [ETH_ADDRESS, ...(tokenPresets[chainId] ?? [])]
  }, [chainId])
  const [tokenList, setTokenList] = useState<Array<ExtendedTokenData>>([])
  const [searchTokenAddress, setSearchTokenAddress] = useState<string>()
  const [searchTokenResult, setSearchTokenResult] = useState<ExtendedTokenData>()

  useEffect(() => {
    setSelectedToken(defaultSelectedToken)
  }, [defaultSelectedToken])

  useEffect(() => {
    onSelectedTokenChange && onSelectedTokenChange(selectedToken)
  }, [selectedToken, onSelectedTokenChange])

  useEffect(() => {
    if (chainId) {
      setConnectedNetwork(getNetworkDataByChainId(chainId))
    } else {
      setConnectedNetwork(undefined)
    }
  }, [chainId])

  // set preset tokens
  useEffect(() => {
    if (chainId && provider && account && connectedNetwork) {
      Promise.all(
        [...new Set([...tokenPresetList, ...(swapTokens[chainId] ?? [])])].map(async (address) => {
          try {
            if (!address) {
              return undefined
            } else if (address === ETH_ADDRESS) {
              const balance = await provider.getBalance(account)
              return {
                ...connectedNetwork.nativeCurrency,
                address: ETH_ADDRESS,
                balance,
              }
            } else if (!isAddress(address)) {
              return undefined
            } else {
              const tokenContract = getContractByAddress(address, ERC20ABI, provider)
              const [tokenData, balance] = await Promise.all([
                getTokenData(address, chainId),
                tokenContract.balanceOf(account) as Promise<BigNumberish>,
              ])
              if (!tokenData) return undefined
              const extendedTokenData: ExtendedTokenData = {
                ...tokenData,
                balance,
              }
              return extendedTokenData
            }
          } catch (err) {
            console.log(err)
            return undefined
          }
        }),
      )
        .then((results) => results.filter((result) => !!result) as ExtendedTokenData[])
        .then(setTokenList)
        .catch((err) => {
          console.log(err)
        })
    } else {
      setTokenList([])
    }
  }, [chainId, provider, account, connectedNetwork, swapTokens, tokenPresetList])

  useEffect(() => {
    if (account && chainId && provider && searchTokenAddress) {
      const tokenContract = new Contract(searchTokenAddress, ERC20ABI, provider)

      Promise.all([
        getTokenData(searchTokenAddress, chainId),
        tokenContract.balanceOf(account) as Promise<BigNumberish>,
      ])
        .then(([tokenData, balance]) => {
          if (tokenData && balance) {
            setSearchTokenResult({ ...tokenData, balance })
          }
        })
        .catch((err: Error) => {
          console.log(err)
          setSearchTokenResult(undefined)
        })

      getTokenData(searchTokenAddress, chainId)
        .then(setSearchTokenResult)
        .catch((err: Error) => {
          console.log(err)
          setSearchTokenResult(undefined)
        })
    } else {
      setSearchTokenResult(undefined)
    }
  }, [account, chainId, provider, searchTokenAddress])

  return (
    <Root
      open={!canSelectToken ? false : dropdownOpen}
      onOpenChange={(isOpen) => setDropdownOpen(!canSelectToken ? false : isOpen)}
    >
      <Trigger className={'w-full h-full flex items-center gap-1 p-2 w-auto outline-none'}>
        <span>{selectedToken ? selectedToken.symbol : s('Select token')}</span>
        {canSelectToken && (
          <DropdownIcon initial={{ rotate: 0 }} animate={{ rotate: dropdownOpen ? '180deg' : '0deg' }} />
        )}
      </Trigger>

      <Portal>
        <Content
          className={
            'text-lg w-screen lg:w-[500px] max-w-full max-h-[50vh] p-2 lg:p-0 pt-0 overflow-none flex flex-col items-stretch'
          }
          align={'start'}
        >
          <Label>
            <Input
              className={'w-full text-sm p-2'}
              placeholder={'Search by address'}
              defaultValue={searchTokenAddress}
              onInput={async (e) => {
                if (chainId && isAddress(e.currentTarget.value)) {
                  setSearchTokenAddress(e.currentTarget.value)
                } else {
                  setSearchTokenAddress(undefined)
                }
              }}
            />
          </Label>
          <TokenSelectorDropdownItems>
            {chainId && searchTokenAddress ? (
              searchTokenResult ? (
                <TokenSelectorDropdownItem onClick={() => setSelectedToken(searchTokenResult)}>
                  <span className={'flex gap-2 items-center'}>
                    <span>{searchTokenResult.symbol}</span>
                  </span>

                  <span className={'flex gap-2 items-center'}>
                    <HumanReadableTokenAmount
                      amount={searchTokenResult.balance}
                      tokenData={searchTokenResult}
                      displayPercent={false}
                      displaySymbol={false}
                    />
                    {!tokenPresetList.some((address) => address === searchTokenAddress) && (
                      <>
                        {tokenList.some((token) => token.address === searchTokenAddress) ? (
                          <Button
                            $size={'sm'}
                            className={'w-7 h-7 rounded-full'}
                            $color={Colors.primary}
                            onClick={(e) => {
                              e.preventDefault()
                              removeToken(chainId, searchTokenAddress)
                            }}
                          >
                            <RxMinus />
                          </Button>
                        ) : (
                          <Button
                            $size={'sm'}
                            className={'w-7 h-7 rounded-full'}
                            $color={Colors.primary}
                            onClick={(e) => {
                              e.preventDefault()
                              addToken(chainId, searchTokenAddress)
                            }}
                          >
                            <RxPlus />
                          </Button>
                        )}
                      </>
                    )}
                  </span>
                </TokenSelectorDropdownItem>
              ) : (
                <div className={'flex justify-center items-center p-4'}>Searching...</div>
              )
            ) : (
              chainId &&
              canSelectToken &&
              tokenList
                ?.sort((a, b) => {
                  // until we have usd values, we have to sort by token balance and fall back to alphanumeric sorting
                  const precision = BigInt(18)
                  const ab = BigInt(
                    formatUnits(BigInt(a.balance.toString()) * BigInt(10) ** precision, a.decimals).split('.')[0],
                  )
                  const bb = BigInt(
                    formatUnits(BigInt(b.balance.toString()) * BigInt(10) ** precision, b.decimals).split('.')[0],
                  )
                  if (ab > bb) return -1
                  if (ab < bb) return 1
                  const as = a.symbol.toLowerCase()
                  const bs = b.symbol.toLowerCase()
                  return as < bs ? -1 : as > bs ? 1 : 0
                })
                .map((tokenData) => (
                  <TokenSelectorDropdownItem
                    key={`${chainId}_${tokenData.address}`}
                    onClick={() => setSelectedToken(tokenData)}
                  >
                    <span className={'flex gap-2 items-center '}>
                      <span>{tokenData.symbol}</span>
                    </span>

                    <span className={'flex gap-2 items-center '}>
                      <HumanReadableTokenAmount
                        amount={tokenData.balance}
                        tokenData={tokenData}
                        displayPercent={false}
                        displaySymbol={false}
                      />
                      {!tokenPresetList.some((address) => address === tokenData.address) ? (
                        <Button
                          $size={'sm'}
                          className={'w-7 h-7 rounded-full hover:bg-red-500'}
                          $color={Colors.primary}
                          onClick={(e) => {
                            e.preventDefault()
                            removeToken(chainId, tokenData.address)
                          }}
                        >
                          <RxMinus />
                        </Button>
                      ) : (
                        <span className={'w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700'}></span>
                      )}
                    </span>
                  </TokenSelectorDropdownItem>
                ))
            )}
          </TokenSelectorDropdownItems>
        </Content>
      </Portal>
    </Root>
  )
}
