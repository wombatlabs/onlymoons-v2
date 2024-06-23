import { WalletType } from '../types'

/**
 * stores the preferred wallet type in persistent localStorage
 *
 * @param walletType type of the wallet connector
 */
export function setPreferredWalletType(walletType: WalletType) {
  if (walletType === WalletType.None) {
    localStorage.removeItem('OM_WALLET_TYPE')
  } else {
    localStorage.setItem('OM_WALLET_TYPE', walletType.toString())
  }
}
