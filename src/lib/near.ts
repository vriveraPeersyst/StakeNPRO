import { setupWallet } from '@/lib/wallet'
import { providers } from 'near-api-js'

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID || 'mainnet'
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.mainnet.near.org'

// Initialize NEAR connection
export const provider = new providers.JsonRpcProvider({
  url: RPC_URL,
})

// Helper function for view calls
export async function view<T = any>(
  contractId: string, 
  method: string, 
  args: Record<string, any> = {}
): Promise<T> {
  const argsBase64 = Buffer.from(JSON.stringify(args)).toString('base64')
  
  const result = await provider.query({
    request_type: 'call_function',
    finality: 'final',
    account_id: contractId,
    method_name: method,
    args_base64: argsBase64,
  })

  const data = (result as any).result
  return JSON.parse(Buffer.from(data).toString())
}

// Network configuration
export const getNetworkConfig = () => ({
  networkId: NETWORK_ID,
  nodeUrl: RPC_URL,
  walletUrl: NETWORK_ID === 'mainnet' 
    ? 'https://app.mynearwallet.com'
    : 'https://testnet.mynearwallet.com',
  helperUrl: NETWORK_ID === 'mainnet'
    ? 'https://helper.mainnet.near.org'
    : 'https://helper.testnet.near.org',
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_BASE || 'https://nearblocks.io',
})

// Initialize wallet selector on client side
export const initializeNear = async () => {
  if (typeof window === 'undefined') return null
  
  return setupWallet()
}
