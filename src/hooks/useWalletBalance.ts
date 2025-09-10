'use client'

import { useQuery } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { getAccountBalance } from '@/lib/near'
import { formatNearAmount, parseNearAmount } from '@/lib/pool'

export function useWalletBalance() {
  const { accountId, isConnected } = useWallet()

  const balanceQuery = useQuery({
    queryKey: ['walletBalance', accountId],
    queryFn: () => accountId ? getAccountBalance(accountId) : Promise.resolve('0'),
    enabled: isConnected && !!accountId,
    refetchInterval: 45000, // Increased to 45 seconds to reduce requests
    staleTime: 30000, // Data stays fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if RPC manager has already handled failover
      // The RPC manager handles its own retries across different endpoints
      console.log(`Balance query failed (attempt ${failureCount + 1}):`, error)
      return false // Let RPC manager handle all retries internally
    },
    retryDelay: 0, // No delay since we're not retrying
  })

  const balanceInNear = balanceQuery.data ? formatNearAmount(balanceQuery.data) : '0'
  
  // Calculate percentage amounts with a small buffer for gas fees
  const calculatePercentageAmount = (percentage: number): string => {
    if (!balanceQuery.data || balanceQuery.data === '0') return '0'
    
    const balanceNum = parseFloat(balanceInNear)
    // Reserve 0.1 NEAR for gas fees
    const availableBalance = Math.max(0, balanceNum - 0.1)
    const amount = availableBalance * percentage
    
    return amount > 0 ? amount.toFixed(6) : '0'
  }

  const getMaxAmount = (): string => {
    if (!balanceQuery.data || balanceQuery.data === '0') return '0'
    
    const balanceNum = parseFloat(balanceInNear)
    // Reserve 0.1 NEAR for gas fees
    const maxAmount = Math.max(0, balanceNum - 0.1)
    
    return maxAmount > 0 ? maxAmount.toFixed(6) : '0'
  }

  return {
    balance: balanceInNear,
    balanceYocto: balanceQuery.data || '0',
    isLoading: balanceQuery.isLoading,
    error: balanceQuery.error,
    calculatePercentageAmount,
    getMaxAmount,
    refetch: balanceQuery.refetch,
  }
}
