'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { depositAndStake } from '@/lib/pool'

export function useStake() {
  const { connector, accountId } = useWallet()
  const queryClient = useQueryClient()
  const [txHash, setTxHash] = useState<string | null>(null)

  const stakeMutation = useMutation({
    mutationFn: async (amountNear: string) => {
      if (!connector) throw new Error('Wallet not connected')
      const hash = await depositAndStake(connector, amountNear)
      setTxHash(hash)
      return hash
    },
    onSuccess: () => {
      // Invalidate and refetch balance queries
      queryClient.invalidateQueries({ queryKey: ['staked', accountId] })
      queryClient.invalidateQueries({ queryKey: ['total', accountId] })
    },
    onError: (error) => {
      console.error('Stake transaction failed:', error)
      setTxHash(null)
    }
  })

  return {
    stake: (amountNear: string) => stakeMutation.mutate(amountNear),
    isLoading: stakeMutation.isPending,
    error: stakeMutation.error,
    txHash,
    reset: () => {
      stakeMutation.reset()
      setTxHash(null)
    }
  }
}
