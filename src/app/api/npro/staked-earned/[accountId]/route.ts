import { NextRequest, NextResponse } from 'next/server'

// Peersyst API endpoint - configurable via environment variable
const PEERSYST_API_BASE = process.env.PEERSYST_API_URL || 'https://near-mobile-production.aws.peersyst.tech/api'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  let accountId: string = ''
  
  try {
    const resolvedParams = await params
    accountId = resolvedParams.accountId

    // Basic validation - let Peersyst server handle account format validation
    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const apiUrl = `${PEERSYST_API_BASE}/npro/staked-earned/${accountId}`
    console.log('Fetching NPRO data from:', apiUrl)

    // Make the request to Peersyst API from server-side (no CORS issues)
    const response = await fetch(apiUrl,
      {
        headers: {
          'Content-Type': 'application/json',
          // Add User-Agent to identify our service
          'User-Agent': 'StakeNPRO-dApp/1.0',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(8000), // 8 second timeout
      }
    )

    // Handle different response codes appropriately
    if (response.status === 404) {
      // Account not found, return No data (standard response)
      return NextResponse.json({
        earned: 'No data',
        accountId: accountId
      })
    }

    if (!response.ok) {
      console.error(`Peersyst API error: ${response.status} ${response.statusText}`)
      console.error('Response URL:', response.url)
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('Error response body:', errorText)
      
      // Return No data for API errors instead of throwing error
      return NextResponse.json({
        earned: 'No data',
        accountId: accountId,
        note: 'Service temporarily unavailable'
      })
    }

    const data = await response.json()
    
    // Validate the response structure
    if (typeof data !== 'object' || data === null) {
      console.error('Invalid response format from Peersyst API:', data)
      return NextResponse.json({
        earned: 'No data',
        accountId: accountId,
        note: 'Invalid response format'
      })
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
      console.error('Request timed out for account:', accountId)
      // Return No data instead of error to prevent UI issues
      return NextResponse.json({
        earned: 'No data',
        accountId: accountId,
        note: 'Service temporarily unavailable'
      })
    }

    // Handle network errors - return No data to keep UI working
    console.error('Network error for account:', accountId, error)
    return NextResponse.json({
      earned: 'No data',
      accountId: accountId,
      note: 'Service temporarily unavailable'
    })
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
