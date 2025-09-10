# RPC Rate Limiting Fixes

## Changes Made

### 1. Enhanced Rate Limiting Detection
Updated `rpcManager.ts` to detect various rate limiting scenarios:
- HTTP 429 status codes
- Messages containing "rate", "throttle", "exceeded", "quota exceeded"
- Network timeouts when combined with previous failures
- Connection errors (ECONNRESET, ECONNREFUSED) when there are existing failures

### 2. Improved Failover Logic
- Automatically switches to next available RPC endpoint when rate limited
- Implements exponential backoff with max 5 second delay
- Blacklists problematic endpoints for 5 minutes
- Provides more fallback RPC endpoints by default

### 3. Better Error Recovery
- Resets failure count when requests succeed
- More aggressive switching for rate limit errors
- Enhanced logging for debugging

### 4. Updated Query Hooks
- Removed redundant retry logic from React Query hooks
- Let RPC manager handle all retries internally
- Simplified error handling

### 5. Default RPC Endpoints
Added more reliable fallback endpoints:
- rpc.shitzuapes.xyz
- 1rpc.io/near
- near.lava.build  
- rpc.ankr.com/near
- public-rpc.blockpi.io/http/near

## How It Works

1. When an RPC request fails with a rate limiting error, the RpcManager:
   - Detects the error type
   - Marks the current endpoint as having failures
   - Immediately switches to the next available endpoint
   - Blacklists the endpoint if it hits the failure threshold

2. Future requests automatically use the new endpoint

3. Blacklisted endpoints are automatically restored after 5 minutes

4. The system continues to cycle through available endpoints until all are exhausted

## Environment Variables

You can configure RPC endpoints via environment variables:

```env
# Primary RPC endpoint
NEXT_PUBLIC_RPC_URL=https://rpc.mainnet.near.org

# Comma-separated fallback endpoints  
NEXT_PUBLIC_RPC_FALLBACKS=https://rpc.shitzuapes.xyz/,https://1rpc.io/near,https://near.lava.build
```

If no fallbacks are provided, the system uses sensible defaults.

## Testing

To test the rate limiting detection:
1. Monitor the browser console for RPC switching messages
2. Check the RPC Status component in the UI
3. Look for "Rate limited" or "Switching to RPC endpoint" messages

## Monitoring

The `RpcStatus` component shows:
- Current active RPC endpoint
- Failure counts for each endpoint
- Blacklist status
- Manual endpoint switching capability
