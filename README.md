# StakeNPRO 🚀

A production-ready NEAR staking dApp that allows users to stake NEAR tokens to the NPRO validator and earn NPRO rewards.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NEAR Protocol](https://img.shields.io/badge/NEAR-Protocol-00C08B?style=flat-square&logo=near)](https://near.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🌟 Overview

StakeNPRO is a modern, secure, and user-friendly staking platform built on the NEAR Protocol. Stake your NEAR tokens with the NPRO validator pool and earn both NEAR staking rewards and NPRO token incentives.

## ✨ Features

- **🔐 Wallet Integration**: Supports multiple wallets via NEAR Wallet Selector (Ledger, MyNearWallet, HERE, HOT, Meteor)
- **💰 Staking Operations**: Stake, unstake, and withdraw NEAR tokens seamlessly
- **📊 Real-time Balances**: View staked, unstaked, and total balances with live updates
- **🎁 NPRO Rewards**: Earn NPRO tokens by staking to the NPRO validator
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **💱 Price Display**: Real-time NEAR to USD conversion (CoinGecko API)
- **⚡ Fast Performance**: Built with Next.js 14 and optimized for speed
- **🔒 Secure**: Client-side transaction signing, no private key exposure

## Supported Wallets

- **Ledger**: Hardware wallet support for maximum security
- **MyNearWallet**: Web wallet for NEAR ecosystem
- **HERE Wallet**: Mobile-first NEAR wallet
- **HOT Wallet**: Telegram-based wallet integration
- **Meteor Wallet**: Browser extension wallet
- **NEAR Mobile**: Native mobile app wallet (coming soon)

## Staking Information

### Validator Pool
- **Pool ID**: `npro.poolv1.near`
- **Network**: NEAR Mainnet
- **Rewards**: NEAR staking rewards + NPRO tokens

### Unstaking Process
- **Duration**: ~30-37 hours (4 epochs)
- **Epoch Length**: ~43,200 blocks (≈7 hours each)
- **Process**: After unstaking, tokens must wait for 4 epochs before they can be withdrawn

### Safety Buffer
- The application automatically reserves **0.02 Ⓝ** for transaction fees when using "Max" stake amount

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Required
NEXT_PUBLIC_NETWORK_ID=mainnet
NEXT_PUBLIC_POOL_ID=npro.poolv1.near
NEXT_PUBLIC_RPC_URL=https://rpc.mainnet.near.org
NEXT_PUBLIC_EXPLORER_BASE=https://nearblocks.io

# Optional Features
NEXT_PUBLIC_SHOW_FIAT=true
NEXT_PUBLIC_SHOW_APR=false
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm package manager
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/stakeNPRO.git
cd stakeNPRO

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 📋 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm preview      # Start production server on port 4000

# Code Quality
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript compiler check
pnpm format       # Format code with Prettier

# Testing
pnpm test         # Run tests with Vitest
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state
- **Blockchain**: NEAR Protocol via near-api-js
- **Wallet Integration**: NEAR Wallet Selector

### Key Components

- `src/lib/wallet.ts` - Wallet Selector configuration and initialization
- `src/lib/pool.ts` - Staking pool interactions and view methods
- `src/lib/near.ts` - NEAR provider and utility functions
- `src/hooks/useWallet.ts` - Wallet connection and state management
- `src/hooks/useBalances.ts` - Account balance queries
- `src/components/StakeCard.tsx` - Main staking interface

### File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and fonts
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── terms/page.tsx     # Terms of service
│   ├── privacy/page.tsx   # Privacy policy
│   └── api/price/route.ts # Price API proxy
├── components/            # React components
│   ├── Navbar.tsx        # Navigation bar
│   ├── StakeCard.tsx     # Main staking interface
│   ├── AmountInput.tsx   # Amount input with chips
│   ├── AppBanner.tsx     # App download banner
│   └── FooterBar.tsx     # Footer component
├── hooks/                # Custom React hooks
│   ├── useWallet.ts      # Wallet management
│   ├── useBalances.ts    # Balance queries
│   ├── useStake.ts       # Staking transactions
│   ├── useUnstake.ts     # Unstaking transactions
│   └── useWithdraw.ts    # Withdrawal transactions
├── lib/                  # Core utilities
│   ├── wallet.ts         # Wallet Selector setup
│   ├── pool.ts           # Pool contract interactions
│   ├── near.ts           # NEAR provider setup
│   └── prices.ts         # Price fetching utilities
└── styles/
    └── tokens.md         # Design token documentation
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🔒 Security Considerations

- All private keys remain in user wallets - this app never handles private keys
- Transactions are signed client-side using Wallet Selector
- Environment variables are properly configured for client/server separation
- Input validation and sanitization on all user inputs
- Safe math operations using NEAR's utility functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For questions and support:
- Review the documentation in this README
- Check the [NEAR Documentation](https://docs.near.org)
- Visit [NEAR Mobile](https://nearmobile.app) for more information about the ecosystem

---

**⚠️ Disclaimer**: This is experimental software. Users should understand the risks involved in staking cryptocurrencies before using this application.
