import { NextRequest, NextResponse } from 'next/server'

// Peersyst API endpoint - configurable via environment variable
const PEERSYST_API_BASE = process.env.PEERSYST_API_URL || 'https://near-mobile-staging.aws.peersyst.tech/api'

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
          // Use a more standard user agent that matches curl
          'User-Agent': 'curl/8.7.1',
          'Accept': '*/*',
        },
        // Increase timeout to 60 seconds
        signal: AbortSignal.timeout(60000), // 60 second timeout
      }
    )

    // Handle different response codes appropriately
    if (response.status === 404) {
      // Account not found, return No data (account doesn't exist in the system)
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

    const contentType = response.headers.get('content-type') || ''
    
    // Handle both JSON and plain text responses
    let earnedValue = '0'
    
    if (contentType.includes('application/json')) {
      const data = await response.json()
      earnedValue = String(data.earned || data || '0')
    } else {
      // Handle plain text response
      const textData = await response.text()
      earnedValue = textData.trim() || '0'
    }

    // Return validated data
    return NextResponse.json({
      earned: earnedValue,
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
