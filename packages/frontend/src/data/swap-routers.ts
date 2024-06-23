import { SwapRouter, UniswapV2Router /* UniswapV3Router */ } from './SwapRouters'

export type SwapRouters = Record<number, Array<SwapRouter>>

export const swapRouters: SwapRouters = {
  // ethereum
  1: [
    new UniswapV2Router({
      name: 'Uniswap',
      code: 'uniswap',
      routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    }),
    new UniswapV2Router({
      name: 'Sushi',
      code: 'sushi',
      routerAddress: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    }),
    new UniswapV2Router({
      name: 'ShibaSwap',
      code: 'shibaswap',
      routerAddress: '0x03f7724180AA6b939894B5Ca4314783B0b36b329',
    }),
  ],
  // polygon
  137: [
    // new UniswapV2Router({
    //   name: 'Uniswap',
    //   code: 'uniswap',
    //   routerAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861565',
    // }),
    new UniswapV2Router({
      name: 'Sushi',
      code: 'sushi',
      routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    }),
    new UniswapV2Router({
      name: 'QuickSwap',
      code: 'quickswap',
      routerAddress: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    }),
  ],
  // base
  8453: [
    new UniswapV2Router({
      name: 'RocketSwap',
      code: 'rocketswap',
      routerAddress: '0x4cf76043b3f97ba06917cbd90f9e3a2aac1b306e',
    }),
    new UniswapV2Router({
      name: 'BaseSwap',
      code: 'baseswap',
      routerAddress: '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86',
    }),
    // // new UniswapV2Router({
    // //   name: 'LeetSwap',
    // //   routerAddress: '0x4bc8090e870301Dc80A2DBec600820BEeb5923A9',
    // // }),
    // new UniswapV2Router({
    //   name: 'synthswap',
    //   routerAddress: '0x8734B3264Dbd22F899BCeF4E92D442d538aBefF0',
    // }),
    new UniswapV2Router({
      name: 'SwapBased',
      code: 'swapbased',
      routerAddress: '0xaaa3b1F1bd7BCc97fD1917c18ADE665C5D31F066',
    }),
    new UniswapV2Router({
      name: 'CBSwap',
      code: 'cbswap',
      routerAddress: '0xc4623408E3060f3c57e1A8D3716123f478E5d82F',
    }),
    // new UniswapV2Router({
    //   name: 'Velocimeter',
    //   routerAddress: '0xE11b93B61f6291d35c5a2beA0A9fF169080160cF',
    // }),
    // broken? even if it's broken, it shouldn't break the whole dex
    // new UniswapV2Router({
    //   name: 'kokonutswap',
    //   routerAddress: '0x9d6328733DAa5b4c7FEE596Ec7E73A935D799179',
    // }),
    // new UniswapV2Router({
    //   name: 'LFGSwap',
    //   routerAddress: '0xF83675ac64a142D92234681B7AfB6Ba00fa38dFF',
    // }),
    // new UniswapV2Router({
    //   name: 'oasisswap',
    //   routerAddress: '0xb588A34aFA5be3F3Af703159fb6586A2cAF04Ba8',
    // }),
    // new UniswapV2Router({
    //   name: 'Degen Brain Finance',
    //   routerAddress: '0x70e44d51439f92044E40559Dcd6a193c98b60a1e',
    // }),
    // new UniswapV2Router({
    //   name: 'Archly',
    //   routerAddress: '0xeafBFeb64F8e3793D7d1767774efd33b203200C9',
    // }),
    // new UniswapV3Router({
    //   name: 'Sushi V3',
    //   routerAddress: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
    //   quoterAddress: '0xb1E835Dc2785b52265711e17fCCb0fd018226a6e',
    // }),
    // new UniswapV3Router({
    //   name: 'Uniswap V3',
    //   routerAddress: '0x2626664c2603336E57B271c5C0b26F421741e481',
    //   quoterAddress: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
    // }),
  ],
}
