import { WalletSelector } from '@near-wallet-selector/core'
import { view } from './near'
import { utils } from 'near-api-js'

const POOL_ID = process.env.NEXT_PUBLIC_POOL_ID || 'zavodil.poolv1.near'
const GAS = '30000000000000' // 30 Tgas

// Pool view methods
export async function getAccountStakedBalance(accountId: string): Promise<string> {
  try {
    const result = await view<string>(POOL_ID, 'get_account_staked_balance', { account_id: accountId })
    return result || '0'
  } catch (error) {
    console.warn('Failed to get staked balance:', error)
    return '0'
  }
}

export async function getAccountUnstakedBalance(accountId: string): Promise<string> {
  try {
    const result = await view<string>(POOL_ID, 'get_account_unstaked_balance', { account_id: accountId })
    return result || '0'
  } catch (error) {
    console.warn('Failed to get unstaked balance:', error)
    return '0'
  }
}

export async function isAccountUnstakedBalanceAvailable(accountId: string): Promise<boolean> {
  try {
    const result = await view<boolean>(POOL_ID, 'is_account_unstaked_balance_available', { account_id: accountId })
    return result || false
  } catch (error) {
    console.warn('Failed to check unstaked balance availability:', error)
    return false
  }
}

export async function getAccountTotalBalance(accountId: string): Promise<string> {
  try {
    const result = await view<string>(POOL_ID, 'get_account_total_balance', { account_id: accountId })
    return result || '0'
  } catch (error) {
    console.warn('Failed to get total balance:', error)
    return '0'
  }
}

export async function getTotalStakedBalance(): Promise<string> {
  try {
    const result = await view<string>(POOL_ID, 'get_total_staked_balance', {})
    return result || '0'
  } catch (error) {
    console.warn('Failed to get total staked balance:', error)
    return '0'
  }
}

// Transaction methods
export async function depositAndStake(selector: WalletSelector, amountNear: string): Promise<string> {
  const wallet = await selector.wallet()
  const amountYocto = utils.format.parseNearAmount(amountNear)
  
  if (!amountYocto) {
    throw new Error('Invalid amount')
  }

  const result = await wallet.signAndSendTransaction({
    receiverId: POOL_ID,
    actions: [
      {
        type: 'FunctionCall',
        params: {
          methodName: 'deposit_and_stake',
          args: {},
          gas: GAS,
          deposit: amountYocto,
        },
      },
    ],
  })

  return result?.transaction?.hash || ''
}

export async function unstake(selector: WalletSelector, amountNear?: string): Promise<string> {
  const wallet = await selector.wallet()
  
  const args = amountNear 
    ? { amount: utils.format.parseNearAmount(amountNear) }
    : {}

  const result = await wallet.signAndSendTransaction({
    receiverId: POOL_ID,
    actions: [
      {
        type: 'FunctionCall',
        params: {
          methodName: 'unstake',
          args,
          gas: GAS,
          deposit: '0',
        },
      },
    ],
  })

  return result?.transaction?.hash || ''
}

export async function withdrawAll(selector: WalletSelector): Promise<string> {
  const wallet = await selector.wallet()

  const result = await wallet.signAndSendTransaction({
    receiverId: POOL_ID,
    actions: [
      {
        type: 'FunctionCall',
        params: {
          methodName: 'withdraw_all',
          args: {},
          gas: GAS,
          deposit: '0',
        },
      },
    ],
  })

  return result?.transaction?.hash || ''
}

// Utility functions
export function formatNearAmount(yoctoNear: string): string {
  return utils.format.formatNearAmount(yoctoNear, 5)
}

export function parseNearAmount(nearAmount: string): string | null {
  return utils.format.parseNearAmount(nearAmount)
}

// Buffer amount for transactions (keep 0.02 NEAR)
export const NEAR_BUFFER = '0.02'
export const NEAR_BUFFER_YOCTO = utils.format.parseNearAmount(NEAR_BUFFER) || '0'
