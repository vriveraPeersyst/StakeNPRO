'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { view } from '@/lib/near'

// Contract addresses (production)
const NPRO_TOKEN_CONTRACT = 'npro.nearmobile.near'
const STAKING_DISTRIBUTION_CONTRACT = 'distribution.nearmobile.near'
// Use local API routes to proxy requests and avoid CORS issues
const CLAIM_API_URL = '/api/npro/claim'
const PENDING_API_URL = '/api/npro/pending'

const GAS = '30000000000000' // 30 Tgas
const STORAGE_DEPOSIT = '1250000000000000000000' // 0.00125 NEAR for token registration

export interface ClaimResult {
  success: boolean
  txHashes: string[]
  errors: string[]
}

export interface PendingNproResponse {
  'pre-launch': string
  rhea_staking: string
}

// Check if account is registered for NPRO token using storage_balance_of
async function checkNproRegistration(accountId: string): Promise<boolean> {
  try {
    const result = await view<{ total: string; available: string } | null>(
      NPRO_TOKEN_CONTRACT,
      'storage_balance_of',
      { account_id: accountId }
    )
    // If result is not null, the account is registered
    return result !== null
  } catch (error) {
    console.warn('NPRO registration check failed:', error)
    return false
  }
}

// Get pending NPRO from API (pre-launch + rhea_staking)
async function getPendingNproFromApi(accountId: string): Promise<PendingNproResponse> {
  try {
    const response = await fetch(`${PENDING_API_URL}/${accountId}`)
    if (!response.ok) {
      console.warn('Failed to fetch pending NPRO:', response.status)
      return { 'pre-launch': '0', rhea_staking: '0' }
    }
    const data = await response.json()
    return {
      'pre-launch': data['pre-launch'] || '0',
      rhea_staking: data.rhea_staking || '0',
    }
  } catch (error) {
    console.warn('Failed to get pending NPRO:', error)
    return { 'pre-launch': '0', rhea_staking: '0' }
  }
}

// Get claimable balance from staking distribution contract
async function getContractClaimableBalance(accountId: string): Promise<string> {
  try {
    const result = await view<string>(
      STAKING_DISTRIBUTION_CONTRACT,
      'claimable_balance_of',
      { account_id: accountId }
    )
    return result || '0'
  } catch (error) {
    console.warn('Failed to get contract claimable balance:', error)
    return '0'
  }
}

// Get total claimable balance (pending API + contract claimable)
export async function getTotalClaimableBalance(accountId: string): Promise<string> {
  try {
    const [pendingData, contractClaimable] = await Promise.all([
      getPendingNproFromApi(accountId),
      getContractClaimableBalance(accountId),
    ])
    
    const preLaunch = BigInt(pendingData['pre-launch'] || '0')
    const rheaStaking = BigInt(pendingData.rhea_staking || '0')
    const contractAmount = BigInt(contractClaimable || '0')
    
    const total = preLaunch + rheaStaking + contractAmount
    return total.toString()
  } catch (error) {
    console.warn('Failed to get total claimable balance:', error)
    return '0'
  }
}

// Claim campaigns from API (referral + rhea campaign)
async function claimCampaigns(accountId: string): Promise<{ success: boolean; data: any; error: string | null }> {
  try {
    const response = await fetch(CLAIM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId }),
    })

    const data = await response.json().catch(() => ({}))

    return {
      success: response.ok,
      data,
      error: response.ok ? null : (data.message || data.error || `HTTP ${response.status}`),
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function useClaim() {
  const { selector, accountId, isConnected } = useWallet()
  const queryClient = useQueryClient()
  const [isRegistering, setIsRegistering] = useState(false)
  const [txHashes, setTxHashes] = useState<string[]>([])

  // Query for total claimable balance (pending API + contract claimable)
  const { data: claimableBalance, isLoading: claimableLoading, refetch: refetchClaimable } = useQuery({
    queryKey: ['claimableBalance', accountId],
    queryFn: () => getTotalClaimableBalance(accountId!),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    enabled: isConnected && !!accountId,
  })

  // Query for contract claimable balance (staking rewards from contract)
  const { data: contractClaimable, isLoading: contractClaimableLoading, refetch: refetchContractClaimable } = useQuery({
    queryKey: ['contractClaimable', accountId],
    queryFn: () => getContractClaimableBalance(accountId!),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    enabled: isConnected && !!accountId,
  })

  // Check NPRO registration status
  const { data: isNproRegistered, isLoading: registrationLoading, refetch: refetchRegistration } = useQuery({
    queryKey: ['nproRegistration', accountId],
    queryFn: () => checkNproRegistration(accountId!),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: isConnected && !!accountId,
  })

  // Register NPRO token
  const registerNpro = useCallback(async (): Promise<string | null> => {
    if (!selector || !accountId) throw new Error('Wallet not connected')
    
    setIsRegistering(true)
    try {
      const wallet = await selector.wallet()
      
      const result = await wallet.signAndSendTransaction({
        receiverId: NPRO_TOKEN_CONTRACT,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'storage_deposit',
              args: { account_id: accountId },
              gas: GAS,
              deposit: STORAGE_DEPOSIT,
            },
          },
        ],
      })
      
      await refetchRegistration()
      return result?.transaction?.hash || null
    } finally {
      setIsRegistering(false)
    }
  }, [selector, accountId, refetchRegistration])

  // Claim from staking distribution contract
  const claimStaking = useCallback(async (amount: string): Promise<string | null> => {
    if (!selector || !accountId) throw new Error('Wallet not connected')
    if (amount === '0' || !amount) throw new Error('No claimable balance')
    
    const wallet = await selector.wallet()
    
    const result = await wallet.signAndSendTransaction({
      receiverId: STAKING_DISTRIBUTION_CONTRACT,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'claim',
            args: { amount },
            gas: GAS,
            deposit: '1', // 1 yocto NEAR required
          },
        },
      ],
    })
    
    return result?.transaction?.hash || null
  }, [selector, accountId])

  // Main claim mutation that handles all steps
  const claimMutation = useMutation({
    mutationFn: async (): Promise<ClaimResult> => {
      if (!selector || !accountId) throw new Error('Wallet not connected')
      
      const result: ClaimResult = {
        success: true,
        txHashes: [],
        errors: [],
      }

      // Step 1: Check and register NPRO token if not registered
      const isRegistered = await checkNproRegistration(accountId)
      if (!isRegistered) {
        try {
          const regTxHash = await registerNpro()
          if (regTxHash) {
            result.txHashes.push(regTxHash)
          }
        } catch (error) {
          result.errors.push(`NPRO registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
          // Stop here if registration fails - can't claim without registration
          result.success = false
          return result
        }
      }

      // Step 2: Claim staking distribution (get balance from contract)
      const currentClaimable = await getContractClaimableBalance(accountId)
      if (currentClaimable && currentClaimable !== '0') {
        try {
          const stakingTxHash = await claimStaking(currentClaimable)
          if (stakingTxHash) {
            result.txHashes.push(stakingTxHash)
          }
        } catch (error) {
          result.errors.push(`Staking claim failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Step 3: Claim campaigns from API (referral + rhea campaign)
      const campaignResult = await claimCampaigns(accountId)
      if (!campaignResult.success && campaignResult.error) {
        // Only add to errors if it's a real error (not "nothing to claim" or "account not found")
        if (!campaignResult.error.toLowerCase().includes('nothing') && 
            !campaignResult.error.toLowerCase().includes('no pending') &&
            !campaignResult.error.toLowerCase().includes('account not found') &&
            !campaignResult.error.toLowerCase().includes('not found')) {
          result.errors.push(`Campaign claim: ${campaignResult.error}`)
        }
      }

      // Set overall success based on whether we have any tx or no errors
      result.success = result.txHashes.length > 0 || result.errors.length === 0
      
      setTxHashes(result.txHashes)
      
      return result
    },
    onSuccess: (result) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['claimableBalance', accountId] })
      queryClient.invalidateQueries({ queryKey: ['contractClaimable', accountId] })
      queryClient.invalidateQueries({ queryKey: ['nproEarned', accountId] })
      queryClient.invalidateQueries({ queryKey: ['pendingNpro', accountId] })
      queryClient.invalidateQueries({ queryKey: ['nproRegistration', accountId] })
      refetchClaimable()
      refetchContractClaimable()
      
      // If no transactions were made (e.g., only API claim was called),
      // refetch again after 5 seconds to get updated balance from API
      if (result.txHashes.length === 0) {
        setTimeout(() => {
          refetchClaimable()
          queryClient.invalidateQueries({ queryKey: ['claimableBalance', accountId] })
          queryClient.invalidateQueries({ queryKey: ['pendingNpro', accountId] })
        }, 5000)
      }
    },
    onError: (error) => {
      console.error('Claim failed:', error)
    },
  })

  // Calculate total claimable (for display purposes)
  const hasClaimable = claimableBalance && claimableBalance !== '0'

  return {
    claim: () => claimMutation.mutate(),
    isLoading: claimMutation.isPending || isRegistering,
    error: claimMutation.error,
    result: claimMutation.data,
    txHashes,
    claimableBalance: claimableBalance || '0',
    contractClaimable: contractClaimable || '0',
    isClaimableLoading: claimableLoading,
    isContractClaimableLoading: contractClaimableLoading,
    hasClaimable,
    isNproRegistered: isNproRegistered ?? false,
    isRegistrationLoading: registrationLoading,
    reset: () => {
      claimMutation.reset()
      setTxHashes([])
    },
    refetch: refetchClaimable,
  }
}
