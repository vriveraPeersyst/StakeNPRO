import { setupWalletSelector, WalletSelector } from '@near-wallet-selector/core'
import { setupModal } from '@near-wallet-selector/modal-ui'
import { setupLedger } from '@near-wallet-selector/ledger'
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet'
import { setupHereWallet } from '@near-wallet-selector/here-wallet'
import { setupHotWallet } from '@near-wallet-selector/hot-wallet'
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet'
import { setupNearMobileWallet } from '@near-wallet-selector/near-mobile-wallet'

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID || 'mainnet'
const CONTRACT_ID = process.env.NEXT_PUBLIC_POOL_ID || 'zavodil.poolv1.near'

let selector: WalletSelector | null = null
let modal: any = null

export const setupWallet = async () => {
  if (selector) return { selector, modal }

  selector = await setupWalletSelector({
    network: NETWORK_ID as 'mainnet',
    modules: [
      setupMyNearWallet() as any,
      setupLedger() as any,
      setupHereWallet() as any,
      setupHotWallet() as any,
      setupMeteorWallet() as any,
      setupNearMobileWallet() as any,
    ],
  })

  modal = setupModal(selector, {
    contractId: CONTRACT_ID,
    methodNames: ['deposit_and_stake', 'unstake', 'withdraw_all'],
  })

  return { selector, modal }
}

export const getWallet = () => {
  if (!selector) throw new Error('Wallet not initialized')
  return { selector, modal }
}

// Types for wallet state
export interface WalletState {
  accountId: string | null
  isConnected: boolean
  isLoading: boolean
}

export interface WalletContextType extends WalletState {
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  selector: WalletSelector | null
}
