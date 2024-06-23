import { FC, useMemo } from 'react'
import { BigNumber, BigNumberish, utils } from 'ethers'
import { ExtendedTokenData } from '../types'
import { getPrecisionForNumberString, getTokenAmountPercent } from '../util'

const { commify, formatUnits } = utils

export interface HumanReadableTokenAmountProps {
  amount: BigNumberish
  tokenData: ExtendedTokenData
  displaySymbol?: boolean
  displayPercent?: boolean
  precision?: number
}

export const HumanReadableTokenAmount: FC<HumanReadableTokenAmountProps> = ({
  amount,
  tokenData,
  displaySymbol = true,
  displayPercent = true,
  precision = 4,
}) => {
  const amountBigNum = useMemo<BigNumber>(() => BigNumber.from(amount), [amount])
  const formattedAmount = useMemo<string>(() => {
    const str = formatUnits(amountBigNum, tokenData.decimals)
    const [wholeNumbers, decimalNumbers] = str.split('.')
    if (!wholeNumbers && !decimalNumbers) {
      return '0'
    }
    if (wholeNumbers?.length >= 4 || !decimalNumbers || decimalNumbers.length === 0 || decimalNumbers === '0') {
      return commify(wholeNumbers)
    }
    // snip off some decimals, but we probably should check how many leading zeroes are present
    return commify(
      `${wholeNumbers}.${decimalNumbers.substring(
        0,
        Math.min(decimalNumbers.length, getPrecisionForNumberString(str)),
      )}`,
    )
  }, [amountBigNum])

  return (
    <>
      {/*{humanNumber(Number.parseFloat(formatUnits(amountBigNum, tokenData.decimals)), (n) =>*/}
      {/*  n.toLocaleString(undefined, { maximumFractionDigits: precision }),*/}
      {/*)}{' '}*/}
      {formattedAmount} {displaySymbol ? tokenData.symbol : ''}
      {displayPercent ? (
        <>
          {' '}
          ({getTokenAmountPercent(amountBigNum, tokenData, 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          %)
        </>
      ) : (
        ''
      )}
    </>
  )
}
