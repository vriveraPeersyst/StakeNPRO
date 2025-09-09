import { NextRequest, NextResponse } from 'next/server'

// Optional price API proxy to avoid CORS issues
export async function GET(request: NextRequest) {
  try {
    // Check if fiat prices are enabled
    if (process.env.NEXT_PUBLIC_SHOW_FIAT !== 'true') {
      return NextResponse.json({ error: 'Fiat prices disabled' }, { status: 404 })
    }

    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd&include_last_updated_at=true',
      {
        headers: {
          'Accept': 'application/json',
        },
        // Cache for 5 minutes
        next: { revalidate: 300 }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch price')
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Price API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price data' }, 
      { status: 500 }
    )
  }
}
