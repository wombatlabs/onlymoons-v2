import { /* useMemo, */ useState } from 'react'
import { ApprovalState } from '../types'
// import { Contract } from '@ethersproject/contracts'
// import { getContractByAddress } from '../util'
// import { ERC20 } from '../contracts/external_contracts.json'
// import { Provider } from '@ethersproject/providers'

// const { abi: ERC20ABI } = ERC20

export function useTokenApproval(_chainId: number, _tokenAddress: string) {
  const [approvalState /* setApprovalState */] = useState<ApprovalState>()
  // const provider = useMemo<Provider | undefined>(() => {
  //   return undefined
  // }, [chainId])
  // const tokenContract = useMemo<Contract | undefined>(() => {
  //   return provider ? getContractByAddress(tokenAddress, ERC20ABI, provider) : undefined
  // }, [tokenAddress, provider])
  const [allowance /* setAllowance */] = useState<bigint>(BigInt(0))

  return {
    allowance,
    approvalState,
  }
}
