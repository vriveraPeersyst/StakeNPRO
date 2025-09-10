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
        }))
      } else if (!state.isConnected && isSignedIn && accountId) {
        setState(prev => ({
          ...prev,
          accountId,
          isConnected: true,
        }))
      } else if (state.accountId !== accountId) {
        setState(prev => ({
          ...prev,
          accountId,
          isConnected: !!accountId,
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
    try {
      const wallet = await state.selector.wallet()
      await wallet.signOut()
      setState(prev => ({
        ...prev,
        accountId: null,
        isConnected: false,
      }))
    } catch (error) {
      console.error('Error signing out:', error)
      // Force disconnect state even if signOut fails
      setState(prev => ({
        ...prev,
        accountId: null,
        isConnected: false,
      }))
    }
  }

  return {
    ...state,
    signIn,
    signOut,
  }
}
