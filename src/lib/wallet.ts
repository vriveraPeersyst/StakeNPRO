import type { NearConnector as NearConnectorType, WalletManifest } from '@hot-labs/near-connect'

// Wallet shown first in the selector.
const PREFERRED_WALLET_ID = 'near-mobile'

// Same manifest sources near-connect uses by default (it doesn't export them).
// We load the manifest ourselves so we can reorder it: the selector lists
// wallets in manifest order. Wallets injected by browser extensions are still
// placed above the manifest ones by near-connect.
const MANIFEST_URLS = [
  'https://raw.githubusercontent.com/hot-dao/near-selector/refs/heads/main/repository/manifest.json',
  'https://cdn.jsdelivr.net/gh/azbang/hot-connector/repository/manifest.json',
]

type Manifest = { wallets: WalletManifest[]; version: string }

async function loadManifest(): Promise<Manifest | undefined> {
  for (const url of MANIFEST_URLS) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const manifest: Manifest = await res.json()
      if (!Array.isArray(manifest?.wallets)) continue
      const preferred = manifest.wallets.filter((w) => w.id === PREFERRED_WALLET_ID)
      const others = manifest.wallets.filter((w) => w.id !== PREFERRED_WALLET_ID)
      return { ...manifest, wallets: [...preferred, ...others] }
    } catch {
      // try the next source
    }
  }
  // Let near-connect load (and order) the manifest itself.
  return undefined
}

let connectorPromise: Promise<NearConnectorType> | null = null

export function getConnector(): Promise<NearConnectorType> {
  if (!connectorPromise) {
    connectorPromise = (async () => {
      const [{ NearConnector }, manifest] = await Promise.all([
        import('@hot-labs/near-connect'),
        loadManifest(),
      ])
      return new NearConnector({
        manifest,
        footerBranding: {
          icon: 'https://peersyst-public-production.s3.eu-west-1.amazonaws.com/5e2f6863-5292-4c08-b585-08125e67e98b.png',
          heading: 'NEAR Connector',
          link: 'https://wallet.near.org',
          linkText: "Don't have a wallet?",
        },
      })
    })().catch((error) => {
      connectorPromise = null
      throw error
    })
  }
  return connectorPromise
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
