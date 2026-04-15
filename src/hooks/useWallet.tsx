'use client'

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'
import type { NearConnector as NearConnectorType } from '@hot-labs/near-connect'

interface WalletState {
  accountId: string | null
  isConnected: boolean
  isLoading: boolean
  connector: NearConnectorType | null
  walletName?: string
}

interface WalletContextValue extends WalletState {
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    accountId: null,
    isConnected: false,
    isLoading: true,
    connector: null,
    walletName: undefined,
  })
  const connectorRef = useRef<NearConnectorType | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const { NearConnector } = await import('@hot-labs/near-connect')
      const connector = new NearConnector({
        footerBranding: {
          icon: 'https://peersyst-public-production.s3.eu-west-1.amazonaws.com/5e2f6863-5292-4c08-b585-08125e67e98b.png',
          heading: 'NEAR Connector',
          link: 'https://wallet.near.org',
          linkText: "Don't have a wallet?",
        },
      })

      if (cancelled) return
      connectorRef.current = connector

      connector.on('wallet:signIn', async (t) => {
        const addr = t.accounts[0]?.accountId
        if (addr) {
          setState(prev => ({
            ...prev,
            accountId: addr,
            isConnected: true,
            connector,
          }))
        }
      })

      connector.on('wallet:signOut', () => {
        setState(prev => ({
          ...prev,
          accountId: null,
          isConnected: false,
          walletName: undefined,
        }))
      })

      // Check if already signed in
      try {
        const wallet = await connector.wallet()
        if (wallet) {
          const accounts = await wallet.getAccounts()
          if (accounts.length > 0) {
            setState({
              accountId: accounts[0].accountId,
              isConnected: true,
              isLoading: false,
              connector,
            })
            return
          }
        }
      } catch {
        // not signed in yet
      }

      setState({
        accountId: null,
        isConnected: false,
        isLoading: false,
        connector,
      })
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async () => {
    const connector = connectorRef.current
    if (!connector) return
    try {
      await connector.connect()
    } catch (err: any) {
      console.error('Connect failed:', err?.message ?? err)
    }
  }, [])

  const signOut = useCallback(async () => {
    const connector = connectorRef.current
    if (!connector) return
    try {
      const wallet = await connector.wallet()
      await wallet.signOut()
      setState(prev => ({
        ...prev,
        accountId: null,
        isConnected: false,
        walletName: undefined,
      }))
    } catch (err: any) {
      console.error('Disconnect failed:', err?.message ?? err)
      // Force disconnect state even if signOut fails
      setState(prev => ({
        ...prev,
        accountId: null,
        isConnected: false,
        walletName: undefined,
      }))
    }
  }, [])

  const value: WalletContextValue = {
    ...state,
    signIn,
    signOut,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
