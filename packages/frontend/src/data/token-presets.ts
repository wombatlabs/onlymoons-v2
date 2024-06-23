export type TokenPresets = Record<number, Array<string>>

export const tokenPresets: TokenPresets = {
  // ethereum
  1: [
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // weth
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // usdc
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // usdt
    '0x6b175474e89094c44da98b954eedeac495271d0f', // dai
  ],
  // polygon
  137: [
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // wmatic
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // usdc
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // usdt
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // dai
  ],
  // base
  8453: [
    '0x4200000000000000000000000000000000000006', // weth
    '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // usdbc
    '0xEB466342C4d449BC9f53A865D5Cb90586f405215', // axlusdc
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // dai
  ],
}
