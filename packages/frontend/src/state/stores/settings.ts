import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { persistentStateStorage as storage } from '../persistentStateStorage'
import { SupportedLanguage, WalletType } from '../../types'

export interface ISettings {
  /**
   * whether or not to include test nets
   */
  includeTestNets: boolean
  setIncludeTestNets: (includeTestNets: boolean) => void
  preferredWalletType: WalletType
  setPreferredWalletType: (preferredWalletType: WalletType) => void
  hideAccountAddress: boolean
  setHideAccountAddress: (hideAccountAddress: boolean) => void
  lang: SupportedLanguage
  setLang: (lang: SupportedLanguage) => void
  realtimeUpdates: boolean
  setRealtimeUpdates: (realtimeUpdates: boolean) => void
  /**
   * slippage is clamped to 0-99.
   * please be careful :)
   */
  swapSlippage: number
  setSwapSlippage: (swapSlippage: number) => void
  autoSwapSlippage: boolean
  setAutoSwapSlippage: (autoSwapSlippage: boolean) => void
}

export const useSettings = create<ISettings>()(
  persist(
    (set) => ({
      includeTestNets: false,
      setIncludeTestNets: (includeTestNets) => set({ includeTestNets }),
      preferredWalletType: WalletType.None,
      setPreferredWalletType: (preferredWalletType) => set({ preferredWalletType }),
      hideAccountAddress: false,
      setHideAccountAddress: (hideAccountAddress) => set({ hideAccountAddress }),
      lang: SupportedLanguage.en,
      setLang: (lang) => set({ lang }),
      realtimeUpdates: true,
      setRealtimeUpdates: (realtimeUpdates) => set({ realtimeUpdates }),
      swapSlippage: 0.5,
      setSwapSlippage: (swapSlippage) =>
        set({ swapSlippage: Math.min(99, Math.max(0, swapSlippage)), autoSwapSlippage: false }),
      autoSwapSlippage: true,
      setAutoSwapSlippage: (autoSwapSlippage) => set({ autoSwapSlippage }),
    }),
    {
      name: 'settings-store',
      storage,
    },
  ),
)
