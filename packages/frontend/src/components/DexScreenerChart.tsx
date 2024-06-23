import { FC, IframeHTMLAttributes } from 'react'
import { useDexScreenerChartAddress } from '../hooks/useDexScreenerChartAddress'

export interface DexScreenerChartProps extends Omit<IframeHTMLAttributes<HTMLIFrameElement>, 'src'> {
  chainId?: number
  pairAddress?: string
}

export const DexScreenerChart: FC<DexScreenerChartProps> = ({ className, chainId, pairAddress, ...rest }) => {
  const { chartAddress } = useDexScreenerChartAddress(chainId, pairAddress)

  return <iframe className={`w-full outline-none ${className}`} src={chartAddress} {...rest}></iframe>
}
