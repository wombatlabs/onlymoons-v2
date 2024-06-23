import { FC, ReactNode, useEffect, useState } from 'react'
import { Web3ConnectionProvider } from './Web3/Web3ConnectionProvider'
import { UtilContractProvider } from './Web3/UtilContractProvider'
import { TokenLockerManagerV1ContractProvider } from './Web3/TokenLockerManagerV1ContractProvider'
import { TokenCacheProvider } from './Web3/TokenCacheProvider'
import { LPCacheProvider } from './Web3/LPCacheProvider'
import { TooltipProvider } from '@radix-ui/react-tooltip'

export interface ProvidersProps {
  children?: ReactNode
}

export const Providers: FC<ProvidersProps> = ({ children }) => {
  // NOTE: this "fixes" an issue where managers are not loaded correctly, because
  // the providers are not yet ready to use. waiting for 100ms seems to fix it,
  // but it's very wonky.
  // TODO fix this
  const [waited, setWaited] = useState<boolean>(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setWaited(true)
    }, 100)

    return () => {
      timer && clearTimeout(timer)
    }
  }, [])

  return (
    <Web3ConnectionProvider>
      <UtilContractProvider>
        <TokenCacheProvider>
          <LPCacheProvider>
            <TooltipProvider delayDuration={200}>
              {waited && <TokenLockerManagerV1ContractProvider>{children}</TokenLockerManagerV1ContractProvider>}
            </TooltipProvider>
          </LPCacheProvider>
        </TokenCacheProvider>
      </UtilContractProvider>
    </Web3ConnectionProvider>
  )
}
