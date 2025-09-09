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
    refetchInterval: 30000, // 30 seconds
  })

  const unstakedQuery = useQuery({
    queryKey: ['unstaked', accountId],
    queryFn: () => accountId ? getAccountUnstakedBalance(accountId) : Promise.resolve('0'),
    enabled: isConnected && !!accountId,
    refetchInterval: 30000,
  })

  const totalQuery = useQuery({
    queryKey: ['total', accountId],
    queryFn: () => accountId ? getAccountTotalBalance(accountId) : Promise.resolve('0'),
    enabled: isConnected && !!accountId,
    refetchInterval: 30000,
  })

  const canWithdrawQuery = useQuery({
    queryKey: ['canWithdraw', accountId],
    queryFn: () => accountId ? isAccountUnstakedBalanceAvailable(accountId) : Promise.resolve(false),
    enabled: isConnected && !!accountId && (unstakedQuery.data !== '0'),
    refetchInterval: 30000,
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
