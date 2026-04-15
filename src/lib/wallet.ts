import type { NearConnector as NearConnectorType } from '@hot-labs/near-connect'

let connector: NearConnectorType | null = null

export async function getConnector(): Promise<NearConnectorType> {
  if (connector) return connector

  const { NearConnector } = await import('@hot-labs/near-connect')
  connector = new NearConnector({
    footerBranding: {
      icon: 'https://peersyst-public-production.s3.eu-west-1.amazonaws.com/5e2f6863-5292-4c08-b585-08125e67e98b.png',
      heading: 'NEAR Connector',
      link: 'https://wallet.near.org',
      linkText: "Don't have a wallet?",
    },
  })
  return connector
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
}
