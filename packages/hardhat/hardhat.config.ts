import { readFileSync } from 'node:fs'

import { type HardhatUserConfig } from 'hardhat/config'
import { NetworkUserConfig } from 'hardhat/types'
import '@nomicfoundation/hardhat-toolbox'

import { networks } from '@onlymoons-io/networks'

function mnemonic() {
  try {
    return readFileSync('./mnemonic.txt').toString().trim()
  } catch (e) {
    console.log(
      '☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.',
    )
  }
  return ''
}

// provide config for specific networks here.
// mostly useful for setting gasPrice value.
const NETWORK_OVERRIDES: Record<string, NetworkUserConfig> = {
  mumbai: {
    // gasPrice: 1000000000,
  },
}

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  // we stick to 0.8.10 for now, but perhaps this can be updated later.
  // this is because the previous version of onlymoons deployed using
  // 0.8.10, and we want to be consistent.
  // _maybe_ we can be specify solidity version on a per-contract basis,
  // so we can continue using 0.8.10 for old contracts, and a newer
  // version for new contracts.
  solidity: '0.8.10',
  networks: {
    ...Object.keys(networks).reduce((previousValue, currentValue) => {
      const { rpcURL } = networks[currentValue as keyof typeof networks]
      return {
        ...previousValue,
        [currentValue]: {
          url: rpcURL,
          ...(NETWORK_OVERRIDES[currentValue] ?? {}),
          accounts: {
            mnemonic: mnemonic(),
          },
        },
      }
    }, {}),
  },
}

export default config
