import { Provider } from '@ethersproject/providers'

/**
 *
 * @param timestamp {number} - target timestamp to look for
 * @param provider {Provider} - network provider
 */
export async function getClosestBlock(timestamp: number, provider: Provider) {
  let minBlockNumber = 0
  let maxBlockNumber = await provider.getBlockNumber()
  let closestBlockNumber = Math.floor((maxBlockNumber + minBlockNumber) / 2)
  let closestBlock = await provider.getBlock(closestBlockNumber)
  let foundExactBlock = false

  while (minBlockNumber <= maxBlockNumber) {
    // console.log(`checking blockNumber=${closestBlockNumber}...`)
    if (closestBlock.timestamp === timestamp) {
      foundExactBlock = true
      break
    } else if (closestBlock.timestamp > timestamp) {
      maxBlockNumber = closestBlockNumber - 1
    } else {
      minBlockNumber = closestBlockNumber + 1
    }

    closestBlockNumber = Math.floor((maxBlockNumber + minBlockNumber) / 2)
    closestBlock = await provider.getBlock(closestBlockNumber)
  }

  const previousBlockNumber = closestBlockNumber - 1
  const nextBlockNumber = closestBlockNumber + 1

  // if all we need is the block numbers, we probably will want to skip this part
  const [previousBlock, nextBlock] = await Promise.all([
    provider.getBlock(previousBlockNumber),
    provider.getBlock(nextBlockNumber),
  ])

  return {
    foundExactBlock,
    closestBlockNumber,
    previousBlockNumber,
    previousBlock,
    nextBlockNumber,
    nextBlock,
  }
}
