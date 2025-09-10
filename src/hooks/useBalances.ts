'use client'

import { useQuery } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { 
  getAccountStakedBalance, 
  getAccountUnstakedBalance, 
  getAccountTotalBalance,
  isAccountUnstakedBalanceAvailable 
} from '@/lib/pool'

export function useBalances() {
  const { accountId, isConnected } = useWallet()

  const stakedQuery = useQuery({
    queryKey: ['staked', accountId],
    queryFn: () => accountId ? getAccountStakedBalance(accountId) : Promise.resolve('0'),
    enabled: isConnected && !!accountId,
    refetchInterval: 45000, // Increased to 45 seconds to reduce requests
    staleTime: 30000, // Data stays fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes('rate') || error?.message?.includes('429')) {
        return false
      }
      return failureCount < 2
    },
  })

  const unstakedQuery = useQuery({
    queryKey: ['unstaked', accountId],
    queryFn: () => accountId ? getAccountUnstakedBalance(accountId) : Promise.resolve('0'),
    enabled: isConnected && !!accountId,
    refetchInterval: 45000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.message?.includes('rate') || error?.message?.includes('429')) {
        return false
      }
      return failureCount < 2
    },
  })

  const totalQuery = useQuery({
    queryKey: ['total', accountId],
    queryFn: () => accountId ? getAccountTotalBalance(accountId) : Promise.resolve('0'),
    enabled: isConnected && !!accountId,
    refetchInterval: 45000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.message?.includes('rate') || error?.message?.includes('429')) {
        return false
      }
      return failureCount < 2
    },
  })

  const canWithdrawQuery = useQuery({
    queryKey: ['canWithdraw', accountId],
    queryFn: () => accountId ? isAccountUnstakedBalanceAvailable(accountId) : Promise.resolve(false),
    enabled: isConnected && !!accountId && (unstakedQuery.data !== '0'),
    refetchInterval: 45000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.message?.includes('rate') || error?.message?.includes('429')) {
        return false
      }
      return failureCount < 2
    },
  })

  return {
    staked: stakedQuery.data || '0',
    unstaked: unstakedQuery.data || '0',
    total: totalQuery.data || '0',
    canWithdraw: canWithdrawQuery.data || false,
    isLoading: stakedQuery.isLoading || unstakedQuery.isLoading || totalQuery.isLoading,
    refetch: () => {
      stakedQuery.refetch()
      unstakedQuery.refetch()
      totalQuery.refetch()
      canWithdrawQuery.refetch()
    }
  }
}
