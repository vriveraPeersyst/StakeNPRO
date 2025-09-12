import { NextRequest, NextResponse } from 'next/server'

// Peersyst API endpoint - configurable via environment variable
const PEERSYST_API_BASE = process.env.PEERSYST_API_URL || 'https://near-mobile-production.aws.peersyst.tech/api'

export async function GET(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const { accountId } = params

    // Basic validation - let Peersyst server handle account format validation
    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }
    // Make the request to Peersyst API from server-side (no CORS issues)
    const response = await fetch(
      `${PEERSYST_API_BASE}/npro/staked-earned/${accountId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          // Add User-Agent to identify our service
          'User-Agent': 'StakeNPRO-dApp/1.0',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    )

    // Handle different response codes appropriately
    if (response.status === 404) {
      // Account not found, return 0 earned (standard response)
      return NextResponse.json({
        earned: '0',
        accountId: accountId
      })
    }

    if (!response.ok) {
      console.error(`Peersyst API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { 
          error: 'Failed to fetch NPRO earnings data',
          details: `API returned ${response.status}`
        },
        { status: 502 } // Bad Gateway - external service error
      )
    }

    const data = await response.json()
    
    // Validate the response structure
    if (typeof data !== 'object' || data === null) {
      console.error('Invalid response format from Peersyst API:', data)
      return NextResponse.json(
        { error: 'Invalid response format from earnings service' },
        { status: 502 }
      )
    }

    // Return validated data
    return NextResponse.json({
      earned: String(data.earned || '0'), // Ensure it's always a string
      accountId: accountId
    })

  } catch (error) {
    console.error('Error fetching NPRO earned data:', error)
    
    // Handle timeout specifically
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - earnings service unavailable' },
        { status: 504 } // Gateway Timeout
      )
    }

    // Handle network errors
    return NextResponse.json(
      { error: 'Unable to connect to earnings service' },
      { status: 502 } // Bad Gateway
    )
  }
}

// Add OPTIONS handler for CORS preflight (though not needed for same-origin)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
