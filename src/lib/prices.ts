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
