'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { unstake, unstakeAll } from '@/lib/pool'

export function useUnstake() {
  const { selector, accountId } = useWallet()
  const queryClient = useQueryClient()
  const [txHash, setTxHash] = useState<string | null>(null)

  const unstakeMutation = useMutation({
    mutationFn: async (amountNear: string) => {
      if (!selector) throw new Error('Wallet not connected')
      const hash = await unstake(selector, amountNear)
      setTxHash(hash)
      return hash
    },
    onSuccess: () => {
      // Invalidate and refetch balance queries
      queryClient.invalidateQueries({ queryKey: ['staked', accountId] })
      queryClient.invalidateQueries({ queryKey: ['unstaked', accountId] })
      queryClient.invalidateQueries({ queryKey: ['total', accountId] })
    },
    onError: (error) => {
      console.error('Unstake transaction failed:', error)
      setTxHash(null)
    }
  })

  const unstakeAllMutation = useMutation({
    mutationFn: async () => {
      if (!selector || !accountId) throw new Error('Wallet not connected')
      const hash = await unstakeAll(selector, accountId)
      setTxHash(hash)
      return hash
    },
    onSuccess: () => {
      // Invalidate and refetch balance queries
      queryClient.invalidateQueries({ queryKey: ['staked', accountId] })
      queryClient.invalidateQueries({ queryKey: ['unstaked', accountId] })
      queryClient.invalidateQueries({ queryKey: ['total', accountId] })
    },
    onError: (error) => {
      console.error('Unstake all transaction failed:', error)
      setTxHash(null)
    }
  })

  return {
    unstake: unstakeMutation.mutate,
    unstakeAll: unstakeAllMutation.mutate,
    isLoading: unstakeMutation.isPending || unstakeAllMutation.isPending,
    error: unstakeMutation.error || unstakeAllMutation.error,
    txHash,
    reset: () => {
      unstakeMutation.reset()
      unstakeAllMutation.reset()
      setTxHash(null)
    }
  }
}
