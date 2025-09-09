/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_NETWORK_ID: process.env.NEXT_PUBLIC_NETWORK_ID || 'mainnet',
    NEXT_PUBLIC_POOL_ID: process.env.NEXT_PUBLIC_POOL_ID || 'zavodil.poolv1.near',
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.mainnet.near.org',
    NEXT_PUBLIC_EXPLORER_BASE: process.env.NEXT_PUBLIC_EXPLORER_BASE || 'https://nearblocks.io',
  },
}

export default nextConfig
