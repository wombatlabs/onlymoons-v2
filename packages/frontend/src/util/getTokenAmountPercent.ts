import { BigNumber, BigNumberish } from 'ethers'
import { ExtendedTokenData } from '../types'
import { formatUnits } from 'ethers/lib/utils'

// i think this is wrong :'(
export function getTokenAmountPercent(amount: BigNumberish, tokenData: ExtendedTokenData, scale = 1): number {
  return tokenData.totalSupply == 0
    ? 0
    : (parseFloat(
        formatUnits(
          BigNumber.from(amount)
            // multiply by number of decimals before dividing to maintain precision
            // this could theoretically go beyond uint256 limits....
            .mul(BigNumber.from(10).pow(tokenData.decimals))
            // divide by total supply to get 0-1 range
            .div(tokenData.totalSupply)
            // multiply by 100 to get 0-100% range
            .mul(100),
          tokenData.decimals,
        ),
      ) /
        100) *
        scale
}
