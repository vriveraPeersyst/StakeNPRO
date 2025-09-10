'use client'

import { useState, useEffect } from 'react'
import { WalletSelector } from '@near-wallet-selector/core'
import { setupWallet } from '@/lib/wallet'

interface WalletState {
  accountId: string | null
  isConnected: boolean
  isLoading: boolean
  selector: WalletSelector | null
  walletName?: string
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
    walletName: undefined,
  })
  const [modal, setModal] = useState<any>(null)

  const getWalletName = async (selector: WalletSelector): Promise<string | undefined> => {
    try {
      if (!selector.isSignedIn()) return undefined
      const wallet = await selector.wallet()
      return wallet?.metadata?.name || wallet?.id
    } catch (error) {
      console.warn('Failed to get wallet name:', error)
      return undefined
    }
  }

  useEffect(() => {
    initWallet()
    
    // Set up a periodic check for wallet state (reduced frequency)
    const intervalId = setInterval(checkWalletState, 10000) // Check every 10 seconds (reduced from 5)
    
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const checkWalletState = async () => {
    if (!state.selector) return
    
    try {
      const isSignedIn = state.selector.isSignedIn()
      const accounts = await state.selector.store.getState().accounts
      const accountId = accounts[0]?.accountId || null
      
      // Additional validation: check if wallet is actually accessible
      if (isSignedIn && accountId) {
        try {
          // Try to get wallet instance to verify it's still connected
          const wallet = await state.selector.wallet()
          if (!wallet) {
            throw new Error('Wallet not accessible')
          }
        } catch (walletError) {
          console.warn('Wallet access failed, marking as disconnected:', walletError)
          setState(prev => ({
            ...prev,
            accountId: null,
            isConnected: false,
            walletName: undefined,
          }))
          return
        }
      }
      
      // If we think we're connected but wallet says we're not, update state
      if (state.isConnected && !isSignedIn) {
        setState(prev => ({
          ...prev,
          accountId: null,
          isConnected: false,
          walletName: undefined,
        }))
      } else if (!state.isConnected && isSignedIn && accountId) {
        const walletName = await getWalletName(state.selector!)
        setState(prev => ({
          ...prev,
          accountId,
          isConnected: true,
          walletName,
        }))
      } else if (state.accountId !== accountId) {
        const walletName = accountId ? await getWalletName(state.selector!) : undefined
        setState(prev => ({
          ...prev,
          accountId,
          isConnected: !!accountId,
          walletName,
        }))
      }
    } catch (error) {
      console.error('Error checking wallet state:', error)
      // If there's an error, assume disconnected
      if (state.isConnected) {
        setState(prev => ({
          ...prev,
          accountId: null,
          isConnected: false,
          walletName: undefined,
        }))
      }
    }
  }

  const initWallet = async () => {
    try {
      const { selector: walletSelector, modal: walletModal } = await setupWallet()
      setModal(walletModal)

      const isSignedIn = walletSelector.isSignedIn()
      if (isSignedIn) {
        const accounts = await walletSelector.store.getState().accounts
        const accountId = accounts[0]?.accountId || null
        const walletName = await getWalletName(walletSelector)
        setState({
          accountId,
          isConnected: !!accountId,
          isLoading: false,
          selector: walletSelector,
          walletName,
        })
      } else {
        setState({
          accountId: null,
          isConnected: false,
          isLoading: false,
          selector: walletSelector,
          walletName: undefined,
        })
      }

      // Subscribe to wallet state changes
      walletSelector.store.observable.subscribe(async (storeState: any) => {
        const accountId = storeState.accounts[0]?.accountId || null
        const walletName = accountId ? await getWalletName(walletSelector) : undefined
        setState(prev => ({
          ...prev,
          accountId,
          isConnected: !!accountId,
          isLoading: false,
          walletName,
        }))
      })
    } catch (error) {
      console.error('Failed to initialize wallet:', error)
      setState({
        accountId: null,
        isConnected: false,
        isLoading: false,
        selector: null,
        walletName: undefined,
      })
    }
  }

  const signIn = async () => {
    if (!modal) return
    modal.show()
  }

  const signOut = async () => {
    if (!state.selector) return
    try {
      const wallet = await state.selector.wallet()
      await wallet.signOut()
      setState(prev => ({
        ...prev,
        accountId: null,
        isConnected: false,
        walletName: undefined,
      }))
    } catch (error) {
      console.error('Error signing out:', error)
      // Force disconnect state even if signOut fails
      setState(prev => ({
        ...prev,
        accountId: null,
        isConnected: false,
        walletName: undefined,
      }))
    }
  }

  return {
    ...state,
    signIn,
    signOut,
  }
}
