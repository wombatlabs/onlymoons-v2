import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { persistentStateStorage as storage } from '../persistentStateStorage'
import { ContractEventData } from '../../components/ContractEventList'

/**
 *
 * @param chainId {number} -
 * @param address {string} -
 */
export function constructContractKey(chainId: number, address: string) {
  return `${chainId}_${address}`
}

/**
 *
 * @param event {ContractEventData} -
 */
export function constructContractEventKey(event: ContractEventData) {
  // event.message might not be necessary
  return `${event.time.getTime()}_${event.type}_${event.message}`
}

export interface IContractEventCache {
  /**
   *
   */
  events: Record<string, Array<ContractEventData>>
  /**
   *
   * @param chainId {number} - the network chain id to use
   * @param address {string} - contract address
   */
  getEventsForContract: (chainId: number, address: string) => Array<ContractEventData>
  /**
   *
   * @param chainId {number} - the network chain id to use
   * @param address {string} - contract address
   * @param events {ContractEventData | Array<ContractEventData>} - the event or events to store
   */
  addEvents: (chainId: number, address: string, events: ContractEventData | Array<ContractEventData>) => void
  /**
   *
   */
  resetEvents: () => void
  /**
   *
   */
  lastBlockScanned: Record<string, number>
  /**
   *
   * @param chainId {number} -
   * @param address {string} -
   */
  getLastBlockScanned: (chainId: number, address: string) => number
  /**
   *
   * @param chainId {number} -
   * @param address {string} -
   * @param block {number} -
   */
  setLastBlockScanned: (chainId: number, address: string, block: number) => void
}

export const useContractEventCache = create<IContractEventCache>()(
  persist(
    (set, get) => ({
      events: {},
      getEventsForContract: (chainId, address) => {
        const { events } = get()
        return (events[constructContractKey(chainId, address)] ?? []).map(({ time, ...event }) => ({
          ...event,
          time: new Date(time),
        }))
      },
      addEvents: (chainId, address, _events) => {
        const eventsArray = Array.isArray(_events) ? _events : [_events]
        const { getEventsForContract } = get()
        set(({ events }) => {
          // make sure there are no duplicates!
          const uniqueObject: Record<string, ContractEventData> = {}
          ;[...getEventsForContract(chainId, address), ...eventsArray].forEach((contractEventData) => {
            uniqueObject[constructContractEventKey(contractEventData)] = contractEventData
          })
          const uniqueEvents = Object.values(uniqueObject)
          return {
            events: { ...events, [constructContractKey(chainId, address)]: uniqueEvents },
          }
        })
      },
      resetEvents: () => {
        set({ events: {} })
      },
      lastBlockScanned: {},
      getLastBlockScanned: (chainId, address) => {
        const { lastBlockScanned } = get()
        return lastBlockScanned[constructContractKey(chainId, address)] ?? -1
      },
      setLastBlockScanned: (chainId, address, block) =>
        set(({ lastBlockScanned }) => ({
          lastBlockScanned: { ...lastBlockScanned, [constructContractKey(chainId, address)]: block },
        })),
    }),
    {
      name: 'contract-event-cache-store',
      storage,
    },
  ),
)
