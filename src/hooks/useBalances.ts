'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { 
  getAccountStakedBalance, 
  getAccountUnstakedBalance, 
  getAccountTotalBalance,
  isAccountUnstakedBalanceAvailable,
  formatNearAmount
} from '@/lib/pool'

export function useBalances() {
  const { accountId, isConnected } = useWallet()
  const queryClient = useQueryClient()

  const stakedQuery = useQuery({
    queryKey: ['staked', accountId],
    queryFn: () => accountId ? getAccountStakedBalance(accountId) : Promise.resolve('0'),
    enabled: isConnected && !!accountId,
    refetchInterval: 45000, // Increased to 45 seconds to reduce requests
    staleTime: 30000, // Data stays fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: false, // Let RPC manager handle all retries internally
  })

  const unstakedQuery = useQuery({
    queryKey: ['unstaked', accountId],
    queryFn: () => accountId ? getAccountUnstakedBalance(accountId) : Promise.resolve('0'),
    enabled: isConnected && !!accountId,
    refetchInterval: 45000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: false, // Let RPC manager handle all retries internally
  })

  const totalQuery = useQuery({
    queryKey: ['total', accountId],
    queryFn: () => accountId ? getAccountTotalBalance(accountId) : Promise.resolve('0'),
    enabled: isConnected && !!accountId,
    refetchInterval: 45000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: false, // Let RPC manager handle all retries internally
  })

  const canWithdrawQuery = useQuery({
    queryKey: ['canWithdraw', accountId],
    queryFn: () => accountId ? isAccountUnstakedBalanceAvailable(accountId) : Promise.resolve(false),
    enabled: isConnected && !!accountId && (unstakedQuery.data !== '0') && (parseFloat(formatNearAmount(unstakedQuery.data || '0')) > 0),
    refetchInterval: 45000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: false, // Let RPC manager handle all retries internally
  })

  return {
    staked: stakedQuery.data || '0',
    unstaked: unstakedQuery.data || '0',
    total: totalQuery.data || '0',
    canWithdraw: canWithdrawQuery.data || false,
    isLoading: stakedQuery.isLoading || unstakedQuery.isLoading || totalQuery.isLoading,
    refetch: () => {
      console.log('Refetching all balance queries for pool:', process.env.NEXT_PUBLIC_POOL_ID)
      stakedQuery.refetch()
      unstakedQuery.refetch()
      totalQuery.refetch()
      canWithdrawQuery.refetch()
    },
    // Force fresh data by invalidating cache
    refreshBalances: () => {
      console.log('Forcing fresh balance data from pool:', process.env.NEXT_PUBLIC_POOL_ID)
      queryClient.removeQueries({ queryKey: ['staked', accountId] })
      queryClient.removeQueries({ queryKey: ['unstaked', accountId] })
      queryClient.removeQueries({ queryKey: ['total', accountId] })
      queryClient.removeQueries({ queryKey: ['canWithdraw', accountId] })
    }
  }
}
