import { createContext, FC, ReactNode, useContext } from 'react'

export interface ILockerCacheContext {
  //
}

export const LockerCacheContext = createContext<ILockerCacheContext>({
  //
})

export const useLockerCache = () => useContext(LockerCacheContext)

export interface LockerCacheProviderProps {
  children?: ReactNode
}

export const LockerCacheProvider: FC<LockerCacheProviderProps> = ({ children }) => {
  return (
    <LockerCacheContext.Provider
      value={
        {
          //
        }
      }
    >
      {children}
    </LockerCacheContext.Provider>
  )
}
