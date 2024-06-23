import { FC, ReactNode, Suspense } from 'react'
import { LoadingView } from '../LoadingView'

export interface LoadingSuspenseProps {
  children?: ReactNode
}

export const LoadingSuspense: FC<LoadingSuspenseProps> = ({ children }) => {
  return <Suspense fallback={<LoadingView />}>{children}</Suspense>
}
