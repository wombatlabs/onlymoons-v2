import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { ContractEventData, ContractEventList } from '../ContractEventList'
import { useContractEventCache, useLocale } from '../../state/stores'
import { LockEventsStyles } from './styles'
import { networkConnectors } from '../../providers/Web3/connectors/networkConnectors'
import { Contract, EventFilter, Event } from '@ethersproject/contracts'
import { useLockers } from '../../state/stores'
import { TokenLockData } from '../../types'
import { getClosestBlock, getContractByAddress, getShortAddress } from '../../util'
import contracts from '../../contracts/compiled_contracts.json'
import externalContracts from '../../contracts/external_contracts.json'
import { useTokenCache } from '../../providers/Web3/TokenCacheProvider'
import { TokenData } from '@onlymoons-io/networks'
import { formatUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { RxInfoCircled } from 'react-icons/rx'

const SCAN_DELAY = 250
const BLOCKS_PER_SCAN = 3000

const {
  TokenLockerV1: { abi },
} = contracts

const {
  ERC20: { abi: ERC20ABI },
} = externalContracts

export interface LockEventsProps {
  readonly chainId: number
  readonly lockId: number
  readonly defaultEvents?: Array<ContractEventData>
}

export const LockEvents: FC<LockEventsProps> = ({ chainId, lockId, defaultEvents = [] }) => {
  const { getString: s } = useLocale()
  const {
    addEvents,
    getEventsForContract,
    events: cachedEvents,
    setLastBlockScanned,
    getLastBlockScanned,
  } = useContractEventCache()
  const [network] = useMemo(
    () =>
      networkConnectors().find(([_network, _hooks, _store, { chainId: thisChainId }]) => thisChainId === chainId) ?? [],
    [chainId],
  )
  const [events, setEvents] = useState<Array<ContractEventData>>(defaultEvents)
  const { getLockData } = useLockers()
  const { getTokenData } = useTokenCache()
  const lockData = useMemo<TokenLockData | null>(() => getLockData(chainId, lockId), [chainId, lockId])
  const contract = useMemo<Contract | null>(
    () =>
      !network?.customProvider || !lockData
        ? null
        : getContractByAddress(lockData.contractAddress, abi, network.customProvider),
    [network, chainId, lockData],
  )
  const lockedTokenContract = useMemo<Contract | null>(
    () =>
      !network?.customProvider || !lockData
        ? null
        : getContractByAddress(lockData.token, ERC20ABI, network.customProvider),
    [network, lockData],
  )
  const [startingBlock, setStartingBlock] = useState<number>()
  const [[scanFromBlock, scanToBlock], setScanBlocks] = useState<[from: number, to: number]>([0, 2500])
  const scanBlocksRef = useRef<[from: number, to: number]>([scanFromBlock, scanToBlock])
  const [scanning, setScanning] = useState<boolean>(false)
  const [lockedTokenData, setLockedTokenData] = useState<TokenData>()
  const [customEvents, setCustomEvents] = useState<Array<ContractEventData>>([])

  useEffect(() => {
    if (contract && lockData) {
      setCustomEvents([])
      setEvents([...defaultEvents, ...getEventsForContract(chainId, lockData.contractAddress)])
    }
  }, [chainId, lockData, cachedEvents, contract])

  useEffect(() => {
    if (lockData?.token) {
      getTokenData(lockData.token, chainId).then(setLockedTokenData).catch(console.error)
    }
  }, [lockData, chainId])

  useEffect(() => {
    scanBlocksRef.current[0] = scanFromBlock
    scanBlocksRef.current[1] = scanToBlock
  }, [scanFromBlock, scanToBlock])

  useEffect(() => {
    if (network?.customProvider && lockData) {
      const lastBlockScanned = getLastBlockScanned(chainId, lockData.contractAddress)
      if (lastBlockScanned !== -1) {
        setStartingBlock(lastBlockScanned)
      } else {
        getClosestBlock(lockData.createdAt, network.customProvider)
          .then(({ previousBlockNumber }) => setStartingBlock(previousBlockNumber))
          .catch(console.error)
      }
    }
  }, [network, chainId, lockData])

  // useEffect(() => {
  //   if (startingBlock) {
  //     console.log('startingBlock', startingBlock)
  //     setScanBlocks([startingBlock, startingBlock + BLOCKS_PER_SCAN])
  //   }
  // }, [startingBlock])

  useEffect(() => {
    if (contract && lockedTokenContract && network?.customProvider && startingBlock) {
      let scanTimer: NodeJS.Timeout
      setScanBlocks([startingBlock, startingBlock + BLOCKS_PER_SCAN])
      let currentBlock: number
      const filters: Array<{ contract: Contract; filter: EventFilter; listener: (event: Event) => void }> = [
        {
          contract,
          filter: contract.filters.OwnershipTransferred(),
          listener: async (event: Event) => {
            console.log('OwnershipTransferred event', event)
            const { timestamp } = await event.getBlock()
            if (event.args && event.args.newOwner) {
              const { newOwner } = event.args
              const e: ContractEventData = {
                message: `${s('Transferred to')} ${getShortAddress(newOwner)}`,
                type: 'owner-transfer',
                time: new Date(timestamp * 1000),
              }
              addEvents(chainId, contract.address, e)
            }
          },
        },
        // {
        //   contract,
        //   filter: contract.filters.Deposited(),
        //   listener: async (event: Event) => {
        //     console.log('Deposited event', event)
        //   },
        // },
        {
          contract,
          filter: contract.filters.Extended(),
          listener: async (event: Event) => {
            console.log('Extended event', event)
          },
        },
        {
          contract,
          filter: contract.filters.Withdrew(),
          listener: async (event: Event) => {
            console.log('Withdrew event', event)
            const { timestamp } = await event.getBlock()
            const e: ContractEventData = {
              message: s('Withdrew'),
              type: 'withdraw',
              time: new Date(timestamp * 1000),
            }
            addEvents(chainId, contract.address, e)
            // setEvents((value) => [
            //   ...value,
            //   {
            //     message: s('Withdrew'),
            //     type: 'withdraw',
            //     time: new Date(timestamp * 1000),
            //   },
            // ])
          },
        },
        {
          contract: lockedTokenContract,
          filter: lockedTokenContract.filters.Transfer(null, lockData?.contractAddress),
          listener: async (event: Event) => {
            console.log('Transfer tokens event', event)
            const { timestamp } = await event.getBlock()
            const amount: BigNumber = event.args?.value
            const e: ContractEventData = {
              message: `${s('Added')} ${
                lockedTokenData
                  ? `${formatUnits(amount, lockedTokenData.decimals)} ${lockedTokenData.symbol}`
                  : s('tokens')
              }`,
              type: 'deposit',
              time: new Date(timestamp * 1000),
            }
            addEvents(chainId, contract.address, e)
          },
        },
      ]

      async function batch(fromBlock: number, toBlock: number): Promise<boolean> {
        if (currentBlock && fromBlock < currentBlock) {
          const _events = filters.map(({ contract: eventContract, filter, listener }) => ({
            contract: eventContract,
            events: eventContract.queryFilter(filter, fromBlock, toBlock),
            listener,
          }))

          const contracts = await Promise.all(
            _events.map(async ({ contract: eventContract, events: eventsPromise, listener }) => {
              const events = await eventsPromise
              events.forEach(listener)
              return eventContract
            }),
          )
          contracts.forEach(({ address }) => setLastBlockScanned(chainId, address, toBlock))
          return true
        }
        return false
      }

      async function runBatch() {
        if (contract) {
          setCustomEvents([])
          currentBlock = await contract?.provider?.getBlockNumber()
          if (await batch(scanBlocksRef.current[0], scanBlocksRef.current[1])) {
            setScanBlocks(([_from, to]) => [to + 1, to + BLOCKS_PER_SCAN])
            scanTimer && clearTimeout(scanTimer)
            await new Promise((done) => {
              scanTimer = setTimeout(done, SCAN_DELAY)
            })
            await runBatch()
          } else {
            console.log('stop batching')
          }
        }
      }

      setScanning(true)
      runBatch()
        .catch((err: Error) => {
          console.error(err)
          const e: ContractEventData = {
            message: s('Error scanning events'),
            type: 'error',
            time: new Date(),
          }
          setCustomEvents((value) => [...value, e])
        })
        .then(() => setScanning(false))

      return () => {
        scanTimer && clearTimeout(scanTimer)
      }
    }
  }, [contract, chainId, lockId, lockedTokenContract, network, startingBlock])

  return (
    <LockEventsStyles>
      <div className={'text-xl flex justify-between items-center'}>
        <div className={'flex items-center gap-1'}>
          <span>{s('Lock events')}</span> <RxInfoCircled />
        </div>
        {scanning && scanFromBlock && scanToBlock ? (
          <div className={'text-xs font-mono'}>
            {s('Scanning blocks')} {scanFromBlock}-{scanToBlock}
          </div>
        ) : (
          <></>
        )}
      </div>
      <ContractEventList events={[...events, ...customEvents]} />
    </LockEventsStyles>
  )
}
