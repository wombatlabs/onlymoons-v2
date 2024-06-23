import { BigNumberish } from 'ethers'
import { TokenData } from '@onlymoons-io/networks'

export enum Colors {
  primary = 'primary',
  secondary = 'secondary',
  transparent = 'transparent',
  ghost = 'ghost',
  warning = 'warning',
  danger = 'danger',
  success = 'success',
}

export enum WalletType {
  None = 0,
  MetaMask = 1,
  CoinBase = 2,
  // WalletConnectV1 = 3,
  WalletConnectV2 = 4,
  TrustWallet = 5,
}

export interface ExtendedTokenData extends TokenData {
  readonly totalSupply: BigNumberish
  readonly balance: BigNumberish
}

export interface TokenLockData {
  readonly lockOwner: string
  readonly id: number
  readonly contractAddress: string
  readonly token: string
  readonly isLpToken: boolean
  readonly createdBy: string
  readonly createdAt: number
  readonly unlockTime: number
  readonly balance: BigNumberish
  readonly totalSupply: BigNumberish
}

export interface ExtendedTokenLockData extends TokenLockData {
  readonly chainId: number
}

export interface LPData {
  readonly address: string
  readonly token0: string
  readonly token1: string
  readonly balance0: BigNumberish
  readonly balance1: BigNumberish
  readonly price0: BigNumberish
  readonly price1: BigNumberish
}

export interface LPLockData extends LPData {
  readonly hasLpData: boolean
  readonly id: number
}

export enum SupportedLanguage {
  en = 'en',
}

export type ContractEventType = 'create' | 'deposit' | 'withdraw' | 'extend' | 'unlock' | 'owner-transfer' | 'error'

export type StyledLinkStyle = 'none' | 'primary' | 'secondary' | 'danger' | 'warn' | 'info'

export interface DexScreenerPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceNative: string
  priceUsd?: string
  txns: {
    m5: {
      buys: number
      sells: number
    }
    h1: {
      buys: number
      sells: number
    }
    h6: {
      buys: number
      sells: number
    }
    h24: {
      buys: number
      sells: number
    }
  }
  volume: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  priceChange: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  liquidity?: {
    usd?: number
    base: number
    quote: number
  }
  fdv?: number
  pairCreatedAt?: number
}

export type ImpactLevel = 'high' | 'medium' | 'low'

export type ElemSize = 'sm' | 'md' | 'lg' | 'xl'

export type ApprovalState = 'unapproved' | 'approving' | 'approved'

export type LockState = 'locked' | 'unlocked' | 'empty' | 'unknown'
