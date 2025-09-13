import { WalletSelector } from '@near-wallet-selector/core'
import { view } from './near'
import { utils } from 'near-api-js'

const POOL_ID = process.env.NEXT_PUBLIC_POOL_ID || 'npro.poolv1.near'
const GAS = '30000000000000' // 30 Tgas

// Pool view methods
export async function getAccountStakedBalance(accountId: string): Promise<string> {
  try {
    console.log(`Fetching staked balance for ${accountId} from pool: ${POOL_ID}`)
    const result = await view<string>(POOL_ID, 'get_account_staked_balance', { account_id: accountId })
    return result || '0'
  } catch (error) {
    console.warn('Failed to get staked balance:', error)
    return '0'
  }
}

export async function getAccountUnstakedBalance(accountId: string): Promise<string> {
  try {
    console.log(`Fetching unstaked balance for ${accountId} from pool: ${POOL_ID}`)
    const result = await view<string>(POOL_ID, 'get_account_unstaked_balance', { account_id: accountId })
    console.log(`Unstaked balance for ${accountId} in pool ${POOL_ID}: ${result}`)
    return result || '0'
  } catch (error) {
    console.warn('Failed to get unstaked balance:', error)
    return '0'
  }
}

export async function isAccountUnstakedBalanceAvailable(accountId: string): Promise<boolean> {
  try {
    console.log(`Checking unstaked balance availability for ${accountId} from pool: ${POOL_ID}`)
    const result = await view<boolean>(POOL_ID, 'is_account_unstaked_balance_available', { account_id: accountId })
    console.log(`Unstaked balance available for ${accountId} in pool ${POOL_ID}: ${result}`)
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

export async function unstake(selector: WalletSelector, amountNear: string): Promise<string> {
  const wallet = await selector.wallet()
  
  const args = { amount: utils.format.parseNearAmount(amountNear) }

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

export async function unstakeAll(selector: WalletSelector, accountId: string): Promise<string> {
  const wallet = await selector.wallet()
  
  // Get the current staked balance in yoctoNEAR
  const stakedBalanceYocto = await getAccountStakedBalance(accountId)
  
  const args = { amount: stakedBalanceYocto }

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
  try {
    // Convert yoctoNEAR to NEAR manually for better precision control
    // 1 NEAR = 10^24 yoctoNEAR
    const yoctoNum = BigInt(yoctoNear)
    const nearDecimals = BigInt('1000000000000000000000000') // 10^24
    
    // Get whole NEAR part
    const wholePart = yoctoNum / nearDecimals
    // Get fractional part
    const fractionalPart = yoctoNum % nearDecimals
    
    // Convert to string with proper decimal places
    const fractionalStr = fractionalPart.toString().padStart(24, '0')
    // Take only first 6 decimal places and remove trailing zeros
    const trimmedFractional = fractionalStr.slice(0, 6).replace(/0+$/, '')
    
    if (trimmedFractional === '') {
      return wholePart.toString()
    } else {
      return `${wholePart.toString()}.${trimmedFractional}`
    }
  } catch (error) {
    console.error('Error formatting NEAR amount:', error)
    // Fallback to utils function
    return utils.format.formatNearAmount(yoctoNear, 6)
  }
}

export function parseNearAmount(nearAmount: string): string | null {
  return utils.format.parseNearAmount(nearAmount)
}

// Buffer amount for transactions (keep 0.02 NEAR)
export const NEAR_BUFFER = '0.02'
export const NEAR_BUFFER_YOCTO = utils.format.parseNearAmount(NEAR_BUFFER) || '0'
