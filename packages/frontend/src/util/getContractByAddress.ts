import { Contract, ContractInterface } from '@ethersproject/contracts'
import { Provider } from '@ethersproject/providers'
import { Signer } from 'ethers'

/**
 *
 * @param address used for initializing {@link Contract}
 * @param abi contract ABI - used for initializing {@link Contract}
 * @param provider ethers provider to use with {@link Contract} instance
 */
export function getContractByAddress(address: string, abi: ContractInterface, provider: Signer | Provider) {
  return new Contract(address, abi, provider)
}
