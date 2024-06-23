import { FC } from 'react'
import {
  RxCalendar,
  RxEnvelopeClosed,
  RxExclamationTriangle,
  RxLockClosed,
  RxMinusCircled,
  RxPlusCircled,
  RxRadiobutton,
} from 'react-icons/rx'

import { CompactListLayout } from '../Layout/CompactListLayout'
import { HumanReadableDate } from '../HumanReadableDate'

import { ItemMessage, ItemRoot, ItemTime } from './styles'
import { ContractEventType } from '../../types'

export interface ContractEventData {
  message: string
  type: ContractEventType
  time: Date
}

export interface ContractEventListProps {
  events?: Array<ContractEventData>
}

function sorter(a: ContractEventData, b: ContractEventData) {
  return a.time > b.time ? -1 : a.time < b.time ? 1 : 0
}

export const ContractEventList: FC<ContractEventListProps> = ({ events }) => {
  return (
    <CompactListLayout
      className={'lg:max-h-64 lg:overflow-auto font-text text-sm text-gray-400'}
      items={events?.sort(sorter).map(({ message, type, time }, index) => ({
        key: `${index}_${time}_${message}`,
        item: (
          <ItemRoot>
            <ItemMessage>
              {(() => {
                switch (type) {
                  case 'create':
                    return <RxPlusCircled className={'text-green-500'} />
                  case 'deposit':
                    return <RxLockClosed />
                  case 'withdraw':
                    return <RxMinusCircled className={'text-red-500'} />
                  case 'extend':
                    return <RxCalendar />
                  case 'unlock':
                    return <RxExclamationTriangle className={'text-red-500'} />
                  case 'owner-transfer':
                    return <RxEnvelopeClosed />
                  case 'error':
                    return <RxExclamationTriangle className={'text-red-500'} />
                  default:
                    return <RxRadiobutton />
                }
              })()}
              <span>{message}</span>
            </ItemMessage>
            <ItemTime>
              <HumanReadableDate date={time} />
            </ItemTime>
          </ItemRoot>
        ),
      }))}
    />
  )
}
