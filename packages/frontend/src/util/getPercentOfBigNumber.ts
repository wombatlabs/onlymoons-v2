import { BigNumber, BigNumberish } from 'ethers'

export function getPercentOfBigNumber(amount: BigNumberish, percent: BigNumberish = 100): BigNumber {
  const bnZero = BigNumber.from(0)
  const bnPercent = BigNumber.from(percent)
  if (bnPercent.eq(bnZero)) {
    return bnZero
  }
  const bnAmount = BigNumber.from(amount)
  return bnAmount.mul(bnPercent).div(100)
}
