'use client'

import { useState, useEffect } from 'react'
import { WalletSelector } from '@near-wallet-selector/core'
import { setupWallet } from '@/lib/wallet'

interface WalletState {
  accountId: string | null
  isConnected: boolean
  isLoading: boolean
  selector: WalletSelector | null
}

export function useWallet(): WalletState & {
  signIn: () => Promise<void>
  signOut: () => Promise<void>
} {
  const [state, setState] = useState<WalletState>({
    accountId: null,
    isConnected: false,
    isLoading: true,
    selector: null,
  })
  const [modal, setModal] = useState<any>(null)

  useEffect(() => {
    initWallet()
  }, [])

  const initWallet = async () => {
    try {
      const { selector: walletSelector, modal: walletModal } = await setupWallet()
      setModal(walletModal)

      const isSignedIn = walletSelector.isSignedIn()
      if (isSignedIn) {
        const accounts = await walletSelector.store.getState().accounts
        const accountId = accounts[0]?.accountId || null
        setState({
          accountId,
          isConnected: !!accountId,
          isLoading: false,
          selector: walletSelector,
        })
      } else {
        setState({
          accountId: null,
          isConnected: false,
          isLoading: false,
          selector: walletSelector,
        })
      }

      // Subscribe to wallet state changes
      walletSelector.store.observable.subscribe((storeState: any) => {
        const accountId = storeState.accounts[0]?.accountId || null
        setState(prev => ({
          ...prev,
          accountId,
          isConnected: !!accountId,
          isLoading: false,
        }))
      })
    } catch (error) {
      console.error('Failed to initialize wallet:', error)
      setState({
        accountId: null,
        isConnected: false,
        isLoading: false,
        selector: null,
      })
    }
  }

  const signIn = async () => {
    if (!modal) return
    modal.show()
  }

  const signOut = async () => {
    if (!state.selector) return
    const wallet = await state.selector.wallet()
    await wallet.signOut()
    setState(prev => ({
      ...prev,
      accountId: null,
      isConnected: false,
    }))
  }

  return {
    ...state,
    signIn,
    signOut,
  }
}
