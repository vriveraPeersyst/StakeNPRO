# Vercel Deployment Guide for StakeNPRO

## 🚀 Production Deployment Steps

### 1. Prepare Environment Variables
Copy the following environment variables to your Vercel project dashboard under **Settings > Environment Variables**:

```bash
# Required - NEAR Network Configuration
NEXT_PUBLIC_NETWORK_ID=mainnet
NEXT_PUBLIC_POOL_ID=zavodil.poolv1.near

# Primary RPC endpoint - use reliable mainnet RPC
NEXT_PUBLIC_RPC_URL=https://rpc.mainnet.near.org

# Fallback RPC endpoints - comma separated
NEXT_PUBLIC_RPC_FALLBACKS=https://near.lava.build,https://near.blockpi.network/v1/rpc/public,https://rpc.shitzuapes.xyz

# Block explorer
NEXT_PUBLIC_EXPLORER_BASE=https://nearblocks.io

# Optional features
NEXT_PUBLIC_SHOW_FIAT=true
NEXT_PUBLIC_SHOW_APR=false
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# For production deployment
vercel --prod
```

#### Option B: Using GitHub Integration
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables
6. Deploy

### 3. Domain Configuration (Optional)
- Go to **Settings > Domains** in your Vercel project
- Add your custom domain
- Configure DNS settings as instructed

### 4. Performance Optimization
The app is configured with:
- ✅ SWC minification for faster builds
- ✅ Image optimization with WebP/AVIF support
- ✅ Compression enabled
- ✅ Security headers configured
- ✅ Package import optimization for `lucide-react` and `near-api-js`

### 5. SEO Configuration
- ✅ `robots.txt` configured
- ✅ `sitemap.xml` included
- ✅ Meta tags in layout.tsx

## 🔧 Production Checklist

- [ ] Environment variables configured
- [ ] DNS configured (if using custom domain)
- [ ] SSL certificate active
- [ ] All wallet connections tested
- [ ] Staking/unstaking flows tested
- [ ] RPC failover tested
- [ ] Performance monitoring enabled

## 📊 Monitoring

After deployment, monitor:
- **Performance**: Use Vercel Analytics
- **Errors**: Check Vercel Function logs
- **RPC Health**: Monitor RPC Status component
- **User Experience**: Test all wallet connections

## 🛡️ Security Features

- Headers configured for XSS protection
- Content Security Policy ready
- Frame options set to DENY
- No sensitive data in client-side code
- All transactions signed client-side

## 📱 Mobile Testing

After deployment, test on:
- iOS Safari
- Android Chrome
- Wallet mobile apps (HERE, NEAR Mobile)

## 🔄 Updates

For future updates:
1. Test locally with `pnpm build && pnpm start`
2. Run `pnpm lint` and `pnpm typecheck`
3. Push to main branch
4. Automatic deployment on Vercel

---

## Environment Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_NETWORK_ID` | NEAR network (mainnet/testnet) | `mainnet` |
| `NEXT_PUBLIC_POOL_ID` | Validator pool contract | `zavodil.poolv1.near` |
| `NEXT_PUBLIC_RPC_URL` | Primary RPC endpoint | `https://rpc.mainnet.near.org` |
| `NEXT_PUBLIC_RPC_FALLBACKS` | Backup RPC endpoints | `https://near.lava.build,...` |
| `NEXT_PUBLIC_EXPLORER_BASE` | Block explorer URL | `https://nearblocks.io` |
| `NEXT_PUBLIC_SHOW_FIAT` | Show USD prices | `true` |
| `NEXT_PUBLIC_SHOW_APR` | Show APR information | `false` |
