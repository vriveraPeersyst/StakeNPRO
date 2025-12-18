'use client'

import { useQuery } from '@tanstack/react-query'
import { view } from '@/lib/near'
import { getNproPrice } from '@/lib/prices'

const NPRO_TOKEN_CONTRACT = 'npro.nearmobile.near'

// Get NPRO balance for an account using ft_balance_of
async function getNproBalance(accountId: string): Promise<string> {
  try {
    const result = await view<string>(
      NPRO_TOKEN_CONTRACT,
      'ft_balance_of',
      { account_id: accountId }
    )
    return result || '0'
  } catch (error) {
    console.warn('Failed to get NPRO balance:', error)
    return '0'
  }
}

// Convert yoctoNPRO (24 decimals) to NPRO
function formatYoctoToNpro(yoctoAmount: string): string {
  if (!yoctoAmount || yoctoAmount === '0') return '0'
  
  try {
    const divisor = Math.pow(10, 24)
    const nproAmount = parseFloat(yoctoAmount) / divisor
    
    // Format with up to 4 decimal places, removing trailing zeros
    if (nproAmount === 0) return '0'
    if (nproAmount < 0.0001) return '<0.0001'
    
    return nproAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    })
  } catch {
    return '0'
  }
}

export function useNproBalance(accountId: string | null) {
  const balanceQuery = useQuery({
    queryKey: ['nproBalance', accountId],
    queryFn: () => accountId ? getNproBalance(accountId) : Promise.resolve('0'),
    enabled: !!accountId,
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 45000, // Data stays fresh for 45 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: false,
  })

  const priceQuery = useQuery({
    queryKey: ['nproPrice'],
    queryFn: getNproPrice,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Data stays fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
  })

  const balanceInNpro = formatYoctoToNpro(balanceQuery.data || '0')
  const nproPrice = priceQuery.data?.usd ?? null
  
  // Calculate USD value
  const balanceFloat = parseFloat(balanceQuery.data || '0') / Math.pow(10, 24)
  const usdValue = nproPrice !== null && balanceFloat > 0 
    ? balanceFloat * nproPrice 
    : null

  const formatUsdValue = (): string | null => {
    if (usdValue === null) return null
    if (usdValue === 0) return '$0.00'
    if (usdValue < 0.01) return '<$0.01'
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdValue)
  }

  return {
    balance: balanceInNpro,
    balanceYocto: balanceQuery.data || '0',
    nproPrice,
    usdValue: formatUsdValue(),
    isLoading: balanceQuery.isLoading,
    isPriceLoading: priceQuery.isLoading,
    error: balanceQuery.error,
    refetch: balanceQuery.refetch,
  }
}
