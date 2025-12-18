import { NextResponse } from 'next/server'

const NPRO_COMPARISON_API = 'https://nprostake-vs-nearstake-api-kappa.vercel.app/api/compare'

export async function GET() {
  try {
    const response = await fetch(NPRO_COMPARISON_API, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch comparison data' },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: 'Invalid response from comparison API' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      nproApyPercent: result.data.nproStaking?.effectiveApyPercent ?? 0,
      nearApyPercent: result.data.nearStaking?.apyPercent ?? 0,
      summary: result.data.yearlyComparison?.summary ?? '',
      totalStakedNear: result.data.pool?.totalStakedNear ?? 0,
      nproPriceUsd: result.data.prices?.nproUsd ?? 0,
    })
  } catch (error) {
    console.error('Error fetching NPRO comparison:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
