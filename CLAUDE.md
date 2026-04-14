# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StakeNPRO is a NEAR Protocol staking dApp where users stake NEAR tokens to the `npro.poolv1.near` validator and earn NPRO token rewards. Production URL: https://staking.nearmobile.app

## Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check (tsc --noEmit)
pnpm test         # Vitest (no tests exist yet)
pnpm format       # Prettier
pnpm preview      # Production server on port 4000
```

## Architecture

**Next.js 15 App Router** with React 18, TypeScript, Tailwind CSS. Uses `@/*` path alias mapping to `./src/*`.

### Core Layers

- **`src/lib/`** — Non-React infrastructure:
  - `wallet.ts` — Singleton NEAR Wallet Selector setup (Ledger, MyNearWallet, HERE, HOT, Meteor, NEAR Mobile)
  - `near.ts` — RPC `view()` helper with automatic failover via `rpcManager.ts`
  - `rpcManager.ts` — Multi-endpoint RPC manager with failure tracking, blacklisting, and automatic failover across configured RPC URLs
  - `pool.ts` — Staking pool contract view/call methods against `NEXT_PUBLIC_POOL_ID` (staked/unstaked balances, stake/unstake/withdraw actions). Uses 30 Tgas gas constant.
  - `nproCalculations.ts` — NPRO reward bonding curve math using `Decimal.js` and `BigNumber.js`
  - `prices.ts` — NEAR-to-USD price fetching

- **`src/hooks/`** — React hooks wrapping lib layer with TanStack Query:
  - `useWallet.ts` — Wallet connection state management
  - `useBalances.ts`, `useWalletBalance.ts`, `useNproBalance.ts` — Balance queries
  - `useStake.ts`, `useUnstake.ts`, `useWithdraw.ts`, `useClaim.ts` — Transaction mutations
  - `useEarnedNpro.ts`, `useTotalStaked.ts` — NPRO reward calculations
  - `useBlockTime.ts`, `useRpcStatus.ts` — Network status

- **`src/components/`** — UI layer. `Providers.tsx` wraps the app with `QueryClientProvider` (5min stale time). `StakeCard.tsx` is the main staking interface.

- **`src/app/api/`** — Next.js API routes:
  - `price/route.ts` — CoinGecko price proxy
  - `npro/claim/route.ts`, `npro/pending/[accountId]/route.ts`, `npro/staked-earned/[accountId]/route.ts`, `npro/compare/route.ts` — NPRO reward endpoints hitting the Peersyst backend (`PEERSYST_API_URL` env var)

### Key Domain Concepts

- All NEAR amounts are in **yoctoNEAR** (10^24) internally; `near-api-js/utils` handles conversion
- A **0.02 NEAR safety buffer** is reserved when users click "Max" stake
- Unstaking takes **~30-37 hours (4 epochs)** before withdrawal is available
- NPRO rewards follow a bonding curve defined in `nproCalculations.ts`

## Environment Variables

Required `NEXT_PUBLIC_*` vars are defaulted in `next.config.mjs` (network=mainnet, pool=npro.poolv1.near, RPC URLs, explorer). `PEERSYST_API_URL` is server-only for NPRO API routes. See `.env.example` or `vercel.json` for the full set.

## Commit Convention

Uses [Conventional Commits](https://conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
