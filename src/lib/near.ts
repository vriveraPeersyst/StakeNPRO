import { setupWallet } from '@/lib/wallet'
import { providers } from 'near-api-js'
import { rpcManager } from './rpcManager'

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID || 'mainnet'

// Get provider from RPC manager
export const getProvider = () => rpcManager.getProvider()

// Helper function for view calls with automatic failover
export async function view<T = any>(
  contractId: string, 
  method: string, 
  args: Record<string, any> = {}
): Promise<T> {
  const argsBase64 = Buffer.from(JSON.stringify(args)).toString('base64')
  
  return rpcManager.makeRequest(async (provider) => {
    const result = await provider.query({
      request_type: 'call_function',
      finality: 'final',
      account_id: contractId,
      method_name: method,
      args_base64: argsBase64,
    })

    const data = (result as any).result
    return JSON.parse(Buffer.from(data).toString())
  })
}

// Network configuration
export const getNetworkConfig = () => ({
  networkId: NETWORK_ID,
  nodeUrl: rpcManager.getCurrentUrl(),
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

// Get account NEAR balance with automatic failover
export async function getAccountBalance(accountId: string): Promise<string> {
  try {
    return await rpcManager.makeRequest(async (provider) => {
      const account = await provider.query({
        request_type: 'view_account',
        finality: 'final',
        account_id: accountId,
      })

      const balance = (account as any).amount
      // Convert yoctoNEAR to NEAR (1 NEAR = 10^24 yoctoNEAR)
      return balance
    })
  } catch (error) {
    console.error('Error fetching account balance:', error)
    return '0'
  }
}
