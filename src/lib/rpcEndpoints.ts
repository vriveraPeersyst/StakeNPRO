/**
 * Public NEAR mainnet RPC endpoints used by the dApp.
 *
 * Ordered by preference. All of them are keyless public endpoints, so any of
 * them can rate-limit us at any time — `rpcManager` rotates through the list
 * and blacklists endpoints that fail.
 *
 * Notes:
 * - `free.rpc.fastnear.com` is the endpoint NEAR recommends since the
 *   `rpc.mainnet.near.org` public node was deprecated. It is not archival, but
 *   every call this app makes is against final/current state.
 * - `rpc.mainnet.near.org` is kept last: it is deprecated and aggressively
 *   rate-limited, but it still answers and is a useful last resort.
 */
export const DEFAULT_RPC_ENDPOINTS = [
  'https://free.rpc.fastnear.com',
  'https://near.lava.build',
  'https://near.blockpi.network/v1/rpc/public',
  'https://1rpc.io/near',
  'https://near.drpc.org',
  'https://endpoints.omniatech.io/v1/near/mainnet/public',
  'https://nearrpc.aurora.dev',
  'https://rpc.shitzuapes.xyz',
  'https://rpc.mainnet.near.org',
] as const

/** Endpoints configured through env vars, falling back to the defaults above. */
export function getConfiguredRpcEndpoints(): string[] {
  const primary = (process.env.NEXT_PUBLIC_RPC_URL || '').trim()
  const fallbacks = (process.env.NEXT_PUBLIC_RPC_FALLBACKS || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)

  const ordered = [primary, ...fallbacks, ...DEFAULT_RPC_ENDPOINTS].filter(Boolean)

  // De-duplicate while preserving order.
  return Array.from(new Set(ordered))
}
