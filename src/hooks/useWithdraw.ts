'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { withdrawAll } from '@/lib/pool'

export function useWithdraw() {
  const { connector, accountId } = useWallet()
  const queryClient = useQueryClient()
  const [txHash, setTxHash] = useState<string | null>(null)

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (!connector) throw new Error('Wallet not connected')
      const hash = await withdrawAll(connector)
      setTxHash(hash)
      return hash
    },
    onSuccess: () => {
      // Invalidate and refetch balance queries
      queryClient.invalidateQueries({ queryKey: ['unstaked', accountId] })
      queryClient.invalidateQueries({ queryKey: ['total', accountId] })
      queryClient.invalidateQueries({ queryKey: ['canWithdraw', accountId] })
    },
    onError: (error) => {
      console.error('Withdraw transaction failed:', error)
      setTxHash(null)
    }
  })

  return {
    withdraw: withdrawMutation.mutate,
    isLoading: withdrawMutation.isPending,
    error: withdrawMutation.error,
    txHash,
    reset: () => {
      withdrawMutation.reset()
      setTxHash(null)
    }
  }
}
