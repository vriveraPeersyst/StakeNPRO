// Optional fiat price helper using CoinGecko API
const COINGECKO_API = 'https://api.coingecko.com/api/v3'

export interface PriceData {
  usd: number
  lastUpdated: number
}

export async function getNearPrice(): Promise<PriceData | null> {
  if (process.env.NEXT_PUBLIC_SHOW_FIAT !== 'true') {
    return null
  }

  try {
    const response = await fetch(`${COINGECKO_API}/simple/price?ids=near&vs_currencies=usd&include_last_updated_at=true`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch price')
    }

    const data = await response.json()
    const near = data.near
    
    if (!near) {
      return null
    }

    return {
      usd: near.usd,
      lastUpdated: near.last_updated_at * 1000, // Convert to milliseconds
    }
  } catch (error) {
    console.warn('Failed to fetch NEAR price:', error)
    return null
  }
}

export function formatUsdAmount(nearAmount: string, nearPrice: number): string {
  const amountFloat = parseFloat(nearAmount)
  if (isNaN(amountFloat) || amountFloat === 0) return '$0.00'
  
  const usdValue = amountFloat * nearPrice
  
  if (usdValue < 0.01) return '<$0.01'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdValue)
}

export interface NproEarnedData {
  earned: string
  accountId: string
}

export async function getNproEarned(accountId: string): Promise<NproEarnedData | null> {
  if (!accountId) {
    return null
  }

  try {
    const response = await fetch(
      `https://near-mobile-production.aws.peersyst.tech/api/npro/staked-earned/${accountId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    )
    
    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 404) {
        // Account not found, return 0 earned
        return {
          earned: '0',
          accountId: accountId
        }
      }
      throw new Error(`Failed to fetch NPRO earned data: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Validate the response structure
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid response format')
    }
    
    return {
      earned: String(data.earned || '0'), // Ensure it's always a string
      accountId: accountId
    }
  } catch (error) {
    console.warn('Failed to fetch NPRO earned:', error)
    // Return default values instead of null to prevent UI issues
    return {
      earned: '0',
      accountId: accountId
    }
  }
}
