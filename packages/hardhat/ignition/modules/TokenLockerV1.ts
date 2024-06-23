import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const TokenLockerV1Module = buildModule('TokenLockerV1Module', (m) => {
  const util = m.library('Util')
  // deploy this generic erc20 token so that we can use it to deploy TokenLockerV1, which makes it possible to verify
  const erc20 = m.contract('ERC20', ['My Cool Token', 'COOL', 69000000])

  const tokenLockerManagerV1 = m.contract('TokenLockerManagerV1', [], {
    libraries: {
      Util: util,
    },
  })

  const tokenLockerV1 = m.contract(
    'TokenLockerV1',
    //
    [tokenLockerManagerV1, 0, m.getAccount(0), erc20, 99999999999],
    //
    {
      libraries: {
        Util: util,
      },
    },
  )

  return { util, erc20, tokenLockerManagerV1, tokenLockerV1 }
})

export default TokenLockerV1Module
