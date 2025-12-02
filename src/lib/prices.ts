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
  rheaBoost?: string
}

export interface PendingNproData {
  'pre-launch': string
  rhea_staking: string
  accountId: string
}

export async function getPendingNpro(accountId: string): Promise<PendingNproData | null> {
  if (!accountId) {
    return null
  }

  // Block testnet accounts on client side
  if (accountId.endsWith('.testnet')) {
    console.warn('Testnet accounts are not supported for NPRO pending')
    return {
      'pre-launch': '0',
      rhea_staking: '0',
      accountId: accountId
    }
  }

  try {
    const response = await fetch(`/api/npro/pending/${accountId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(65000),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.warn('Failed to fetch NPRO pending:', errorData.error || `HTTP ${response.status}`)
      return {
        'pre-launch': '0',
        rhea_staking: '0',
        accountId: accountId
      }
    }

    const data = await response.json()
    return {
      'pre-launch': String(data['pre-launch'] || '0'),
      rhea_staking: String(data.rhea_staking || '0'),
      accountId: data.accountId || accountId
    }
  } catch (error) {
    console.warn('Failed to fetch NPRO pending:', error)
    return {
      'pre-launch': '0',
      rhea_staking: '0',
      accountId: accountId
    }
  }
}

export async function getNproEarned(accountId: string): Promise<NproEarnedData | null> {
  if (!accountId) {
    return null
  }

  // Block testnet accounts on client side as well for immediate feedback
  if (accountId.endsWith('.testnet')) {
    console.warn('Testnet accounts are not supported for NPRO earnings')
    return {
      earned: '0',
      accountId: accountId
    }
  }

  try {
    // Use our Next.js API route to avoid CORS issues
    const response = await fetch(`/api/npro/staked-earned/${accountId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(65000), // 65 second timeout (5s more than backend)
    })
    
    if (!response.ok) {
      // The API route handles all error cases and returns appropriate responses
      const errorData = await response.json().catch(() => ({}))
      console.warn('Failed to fetch NPRO earned:', errorData.error || `HTTP ${response.status}`)
      
      // Always return No data to prevent UI issues
      return {
        earned: 'No data',
        accountId: accountId
      }
    }

    const data = await response.json()
    
    // The API route already validates the response structure
    return {
      earned: String(data.earned || '0'),
      accountId: data.accountId || accountId
    }
  } catch (error) {
    console.warn('Failed to fetch NPRO earned:', error)
    // Return No data instead of null to prevent UI issues
    return {
      earned: 'No data',
      accountId: accountId
    }
  }
}
