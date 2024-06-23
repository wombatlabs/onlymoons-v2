import { Contract } from '@ethersproject/contracts'
import { Provider } from '@ethersproject/providers'
import { Signer } from 'ethers'
import contracts from '../contracts/compiled_contracts.json'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const contractsAsAny = contracts as any

/**
 *
 * @param name used to search json file for contract data by name
 * @param chainId used to search json file for address to use
 * @param provider ethers provider to use with `Contract` instance
 */
export function getContractByName<ContractType extends Contract = Contract>(
  name: string,
  chainId: number,
  provider: Provider | Signer,
) {
  const contractData = contractsAsAny[name]
  if (!contractData) return undefined
  const address = contractData.networks[chainId.toString()]
  if (!address) return undefined
  const abi = contractData.abi
  if (!abi) return undefined
  return new Contract(address, abi, provider) as ContractType
}
