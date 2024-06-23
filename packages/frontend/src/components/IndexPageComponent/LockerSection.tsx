import { useLocale } from '../../state/stores'
import { Link } from 'react-router-dom'
import { RxDoubleArrowRight } from 'react-icons/rx'

export default function LockerSection() {
  const { getString: s } = useLocale()

  return (
    <section
      className={
        'bg-primary-50 dark:bg-primary-950 z-10 px-4 py-12 md:py-20 border-y border-primary-200 dark:border-none'
      }
    >
      <div className={'max-w-screen-md lg:max-w-screen-lg mx-auto flex flex-col gap-4 justify-between items-center'}>
        <div className={'space-y-4'}>
          <div className={'text-3xl font-extrabold text-center'}>
            <Link to={'/locker'}>{s`Token Locker`}</Link>
          </div>
          <div>
            <p className={'mb-1 text-center'}>{s`Lock LP and team tokens for your project.`}</p>
            {/*<Link to={'/locker'}>*/}
            {/*  <Button className={'inline-flex flex-row items-center gap-1'}>*/}
            {/*    <span>{s`Check it out`}</span>*/}
            {/*    <RxDoubleArrowRight />*/}
            {/*  </Button>*/}
            {/*</Link>*/}
          </div>
        </div>

        <div className={'grid grid-cols-1 md:grid-cols-2 gap-8 mt-8'}>
          <div>
            <div className={'bg-inherit border-t border-secondary-500 p-8'}>
              <div className={'text-xl'}>{s`LP tokens`}</div>
              <ul className={'font-extralight list-disc ml-4'}>
                <li>{s`Uniswap V2`}</li>
                <li>
                  {s`Uniswap V3`} {s`(coming soon™️)`}
                </li>
                <li>{s`Always free forever`}</li>
              </ul>
            </div>
          </div>

          <div>
            <div className={'bg-inherit border-t border-secondary-500 p-8'}>
              <div className={'text-xl'}>{s`ERC20 tokens`}</div>
              <ul className={'font-extralight list-disc ml-4'}>
                <li>{s`Standard ERC20 tokens`}</li>
                <li>{s`Rebase tokens`}</li>
                <li>{s`Tax tokens`}</li>
                <li>{s`Reward tokens w/ claim`}</li>
                <li>{s`Currently free :)`}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
