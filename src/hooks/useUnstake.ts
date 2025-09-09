'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { unstake } from '@/lib/pool'

export function useUnstake() {
  const { selector, accountId } = useWallet()
  const queryClient = useQueryClient()
  const [txHash, setTxHash] = useState<string | null>(null)

  const unstakeMutation = useMutation({
    mutationFn: async (amountNear?: string) => {
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

  return {
    unstake: unstakeMutation.mutate,
    isLoading: unstakeMutation.isPending,
    error: unstakeMutation.error,
    txHash,
    reset: () => {
      unstakeMutation.reset()
      setTxHash(null)
    }
  }
}
