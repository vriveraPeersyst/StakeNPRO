import { providers } from 'near-api-js'

interface RpcEndpoint {
  url: string
  failures: number
  lastFailure?: number
  isBlacklisted: boolean
}

class RpcManager {
  private endpoints: RpcEndpoint[] = []
  private currentIndex: number = 0
  private readonly maxFailures = 3
  private readonly blacklistDuration = 5 * 60 * 1000 // 5 minutes
  private provider: providers.JsonRpcProvider | null = null

  constructor() {
    this.initializeEndpoints()
    this.setupProvider()
  }

  private initializeEndpoints() {
    const primaryUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.mainnet.near.org'
    const fallbackUrls = (process.env.NEXT_PUBLIC_RPC_FALLBACKS || '').split(',').filter(Boolean)
    
    // Add primary endpoint
    this.endpoints.push({
      url: primaryUrl,
      failures: 0,
      isBlacklisted: false
    })

    // Add fallback endpoints
    fallbackUrls.forEach(url => {
      this.endpoints.push({
        url: url.trim(),
        failures: 0,
        isBlacklisted: false
      })
    })
  }

  private setupProvider() {
    const currentEndpoint = this.getCurrentEndpoint()
    if (currentEndpoint) {
      this.provider = new providers.JsonRpcProvider({
        url: currentEndpoint.url,
      })
    }
  }

  private getCurrentEndpoint(): RpcEndpoint | null {
    // Clear blacklisted endpoints if blacklist duration has passed
    this.clearExpiredBlacklists()
    
    // Find next available endpoint
    const availableEndpoints = this.endpoints.filter(ep => !ep.isBlacklisted)
    
    if (availableEndpoints.length === 0) {
      console.warn('All RPC endpoints are blacklisted, resetting...')
      this.resetAllEndpoints()
      return this.endpoints[0]
    }

    // Cycle through available endpoints
    if (this.currentIndex >= availableEndpoints.length) {
      this.currentIndex = 0
    }

    return availableEndpoints[this.currentIndex]
  }

  private clearExpiredBlacklists() {
    const now = Date.now()
    this.endpoints.forEach(endpoint => {
      if (endpoint.isBlacklisted && endpoint.lastFailure) {
        if (now - endpoint.lastFailure > this.blacklistDuration) {
          endpoint.isBlacklisted = false
          endpoint.failures = 0
        }
      }
    })
  }

  private resetAllEndpoints() {
    this.endpoints.forEach(endpoint => {
      endpoint.failures = 0
      endpoint.isBlacklisted = false
      endpoint.lastFailure = undefined
    })
  }

  private switchToNextEndpoint() {
    this.currentIndex = (this.currentIndex + 1) % this.endpoints.length
    this.setupProvider()
    console.log(`Switched to RPC endpoint: ${this.getCurrentEndpoint()?.url}`)
  }

  private handleFailure(error: any) {
    const currentEndpoint = this.getCurrentEndpoint()
    if (!currentEndpoint) return

    // Check if it's a rate limiting error
    const isRateLimit = 
      error?.message?.includes('rate') ||
      error?.message?.includes('429') ||
      error?.code === 429 ||
      error?.message?.includes('Too many requests')

    if (isRateLimit) {
      console.warn(`Rate limited on ${currentEndpoint.url}, switching...`)
      currentEndpoint.failures += 1
      currentEndpoint.lastFailure = Date.now()
      
      if (currentEndpoint.failures >= this.maxFailures) {
        currentEndpoint.isBlacklisted = true
        console.warn(`Blacklisted ${currentEndpoint.url} for ${this.blacklistDuration / 1000}s`)
      }
      
      this.switchToNextEndpoint()
    }
  }

  async makeRequest<T>(requestFn: (provider: providers.JsonRpcProvider) => Promise<T>): Promise<T> {
    if (!this.provider) {
      throw new Error('No RPC provider available')
    }

    const maxRetries = this.endpoints.length
    let lastError: any

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await requestFn(this.provider)
      } catch (error) {
        console.warn(`RPC request failed on attempt ${attempt + 1}:`, error)
        lastError = error
        
        this.handleFailure(error)
        
        // If we have more attempts and more endpoints, try next one
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))) // Exponential backoff
        }
      }
    }

    throw lastError || new Error('All RPC endpoints failed')
  }

  getProvider(): providers.JsonRpcProvider {
    if (!this.provider) {
      throw new Error('No RPC provider available')
    }
    return this.provider
  }

  getCurrentUrl(): string {
    return this.getCurrentEndpoint()?.url || 'unknown'
  }

  getStatus() {
    return {
      currentUrl: this.getCurrentUrl(),
      endpoints: this.endpoints.map(ep => ({
        url: ep.url,
        failures: ep.failures,
        isBlacklisted: ep.isBlacklisted,
        lastFailure: ep.lastFailure
      }))
    }
  }
}

// Singleton instance
export const rpcManager = new RpcManager()
