import BigNumber from 'bignumber.js'

// Gas attached to each call. Values match NEAR Mobile (near-mobile 4.0.x,
// mainnet gas audit of 2026-09-21), measured against the same contracts:
// npro.poolv1.near (staking-pool) and distribution.nearmobile.near.
//
// Keep these tight. Since NEP-642 (protocol 85) the node checks that the
// signer can pay for all attached gas at min_gas_purchase_price, 10x the
// network minimum gas price, before accepting the transaction. The difference
// is refunded afterwards, but the user must hold it up front, so the 300 Tgas
// previously attached to pool calls needed 0.3 NEAR free just to sign.
//
// Every pool method pings first. `deposit_and_stake` and `unstake` always
// restake (a stake promise plus a 20 Tgas `on_stake_action` callback);
// `withdraw_all` only does when its ping is the first pool call of the epoch,
// which is why 30 Tgas withdrawals failed intermittently, so it gets more.
export const STAKE_GAS = '29000000000000' // 29 Tgas, deposit_and_stake
export const UNSTAKE_GAS = '28000000000000' // 28 Tgas, unstake
export const WITHDRAW_GAS = '45000000000000' // 45 Tgas, withdraw_all
export const CLAIM_GAS = '20000000000000' // 20 Tgas, distribution claim
export const STORAGE_DEPOSIT_GAS = '7000000000000' // 7 Tgas, NPRO storage_deposit

export const STORAGE_DEPOSIT = '1250000000000000000000' // 0.00125 NEAR for NPRO registration

// NEP-642 min_gas_purchase_price: 1e9 yoctoNEAR per gas (0.001 NEAR/Tgas).
const MIN_GAS_PURCHASE_PRICE = '1000000000'
// Receipt and send fees the node adds on top of the attached gas when it checks
// the balance (~1.2 Tgas for one function call, rounded up for argument size).
const ACTION_OVERHEAD_GAS = '2000000000000'

// NEAR the signer must hold to submit a single function call, at the gas
// purchase floor. Almost all of the gas part is refunded after execution.
export function reservationYocto(gas: string, deposit = '0'): BigNumber {
  return new BigNumber(gas).plus(ACTION_OVERHEAD_GAS).times(MIN_GAS_PURCHASE_PRICE).plus(deposit)
}

// NEAR kept back when staking with Max or a percentage, so that the user can
// still sign every later transaction: unstake, withdraw, NPRO registration and
// claim. Summed without counting refunds, then rounded up to 0.01 NEAR
// (0.10925 -> 0.11 NEAR).
const RESERVE_ROUNDING = new BigNumber('10000000000000000000000') // 0.01 NEAR
export const STAKE_RESERVE_YOCTO = reservationYocto(UNSTAKE_GAS)
  .plus(reservationYocto(WITHDRAW_GAS))
  .plus(reservationYocto(STORAGE_DEPOSIT_GAS, STORAGE_DEPOSIT))
  .plus(reservationYocto(CLAIM_GAS, '1'))
  .div(RESERVE_ROUNDING)
  .integerValue(BigNumber.ROUND_CEIL)
  .times(RESERVE_ROUNDING)
export const STAKE_RESERVE_NEAR = STAKE_RESERVE_YOCTO.shiftedBy(-24).toString()
