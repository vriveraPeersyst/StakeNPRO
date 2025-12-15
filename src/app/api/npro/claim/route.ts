import { NextRequest, NextResponse } from 'next/server'

// Peersyst API endpoint - configurable via environment variable
const PEERSYST_API_BASE = process.env.PEERSYST_API_URL || 'https://near-mobile-production.aws.peersyst.tech/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId } = body

    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const apiUrl = `${PEERSYST_API_BASE}/npro/claim`
    console.log('Proxying NPRO claim request to:', apiUrl, 'for account:', accountId)

    // Make the request to Peersyst API from server-side (no CORS issues)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'curl/8.7.1',
        'Accept': '*/*',
      },
      body: JSON.stringify({ accountId }),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    })

    const data = await response.json().catch(() => ({}))

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('NPRO claim proxy error:', error)
    
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Request timeout - please try again' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process claim request' },
      { status: 500 }
    )
  }
}
