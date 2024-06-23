import { FC, useMemo, useState } from 'react'
import humanizeDuration from 'humanize-duration'
import { useInterval } from 'react-use'

const dateHumanizer = humanizeDuration.humanizer({
  largest: 1,
  round: true,
  units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'],
})

function formatDateAsDurationString(date: Date) {
  const delta = Date.now() - date.getTime()
  return `${delta < 0 ? 'in ' : ''}${dateHumanizer(delta)}${delta < 0 ? '' : ' ago'}`
}

export interface HumanReadableDateProps {
  date: Date | string
  updateInterval?: number
}

export const HumanReadableDate: FC<HumanReadableDateProps> = ({ date, updateInterval = 5000 }) => {
  const dateObject = useMemo(() => (date instanceof Date ? date : new Date(date)), [date])
  const [updateCounter, setUpdateCounter] = useState<number>(0)
  const formattedDate = useMemo(() => formatDateAsDurationString(dateObject), [dateObject, updateCounter])

  useInterval(() => {
    setUpdateCounter((value) => value + 1)
  }, updateInterval)

  return <>{formattedDate}</>
}
