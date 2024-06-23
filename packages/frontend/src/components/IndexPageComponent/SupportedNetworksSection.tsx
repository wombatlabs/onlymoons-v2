import { StyledTooltip } from '../StyledTooltip'
import networkIcons from '../../assets/network-icons'
import { networkConnectors } from '../../providers/Web3/connectors/networkConnectors'

export default function SupportedNetworksSection() {
  const connectors = networkConnectors({ includeTestNets: false }).sort(
    ([, , , { name: nameA }], [, , , { name: nameB }]) => {
      const na = nameA.toLowerCase()
      const nb = nameB.toLowerCase()
      return na > nb ? 1 : na < nb ? -1 : 0
    },
  )

  return (
    <section className={'grow bg-white dark:bg-primary-900 px-4 py-12 md:py-20'}>
      <div className={'text-center text-3xl font-extrabold'}>Supported networks</div>
      <ul className={'mt-8 grid gap-12 grid-cols-[repeat(auto-fit,minmax(72px,_1fr))] max-w-screen-xl mx-auto'}>
        {connectors.map(([_network, _hooks, _store, networkData]) => (
          <li
            className={
              'mx-auto w-[72px] h-[72px] bg-gray-200 dark:bg-gray-900 dark:bg-opacity-30 rounded-full p-2 flex justify-center items-center overflow-hidden opacity-80 hover:opacity-100 hover:scale-105 transition-all hover:transition-none'
            }
            key={networkData.chainId}
          >
            <StyledTooltip
              trigger={
                <img className={'rounded-full'} src={networkIcons[networkData.chainId]} alt={networkData.name} />
              }
            >
              {networkData.name}
            </StyledTooltip>
          </li>
        ))}
      </ul>
    </section>
  )
}
