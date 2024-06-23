import { FC } from 'react'
import { useLockContext } from './LockDetailsFull'
import { FaExchangeAlt } from 'react-icons/fa'
import { BsCoin, BsQuestionCircle } from 'react-icons/bs'
import { useLocale } from '../state/stores'

export const LockTypeLabel: FC = () => {
  const { lockData } = useLockContext()
  const { getString: s } = useLocale()

  return lockData?.isLpToken ? (
    <span className={'bg-blue-200 dark:bg-blue-600 px-1 py-0.5 rounded text-sm flex gap-1 items-center'}>
      <FaExchangeAlt />
      <span>{s`Liquidity`}</span>
    </span>
  ) : (
    <span className={'bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-sm flex gap-1 items-center'}>
      {lockData ? (
        <>
          <BsCoin />
          <span>{s`Token`}</span>
        </>
      ) : (
        <>
          <BsQuestionCircle />
          <span>{s`Unknown`}</span>
        </>
      )}
    </span>
  )
}
