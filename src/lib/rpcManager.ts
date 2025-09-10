import { providers } from 'near-api-js'

interface RpcEndpoint {
  url: string
  failures: number
  lastFailure?: number
  isBlacklisted: boolean
}

interface RpcStatusChangeListener {
  (newUrl: string): void
}

class RpcManager {
  private endpoints: RpcEndpoint[] = []
  private currentIndex: number = 0
  private readonly maxFailures = 3
  private readonly blacklistDuration = 5 * 60 * 1000 // 5 minutes
  private provider: providers.JsonRpcProvider | null = null
  private listeners: RpcStatusChangeListener[] = []
  private readonly STORAGE_KEY = 'stakeNPRO_rpc_config'

  constructor() {
    this.initializeEndpoints()
    this.loadUserPreferences()
    this.setupProvider()
  }

  private saveUserPreferences() {
    if (typeof window === 'undefined') return

    try {
      const config = {
        primaryRpcUrl: this.getCurrentEndpoint()?.url,
        customEndpoints: this.endpoints
          .filter(ep => !this.isDefaultEndpoint(ep.url))
          .map(ep => ep.url),
        timestamp: Date.now()
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config))
    } catch (error) {
      console.warn('Failed to save RPC preferences:', error)
    }
  }

  private loadUserPreferences() {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (!saved) return

      const config = JSON.parse(saved)
      
      // Add any custom endpoints that were saved
      if (config.customEndpoints && Array.isArray(config.customEndpoints)) {
        config.customEndpoints.forEach((url: string) => {
          if (!this.endpoints.some(ep => ep.url === url)) {
            this.endpoints.push({
              url,
              failures: 0,
              isBlacklisted: false
            })
          }
        })
      }

      // Set the primary RPC if it was saved and exists
      if (config.primaryRpcUrl) {
        const savedPrimaryIndex = this.endpoints.findIndex(ep => ep.url === config.primaryRpcUrl)
        if (savedPrimaryIndex !== -1) {
          // Move the saved primary to the front
          const primaryEndpoint = this.endpoints.splice(savedPrimaryIndex, 1)[0]
          this.endpoints.unshift(primaryEndpoint)
          this.currentIndex = 0
          console.log(`Restored user's preferred RPC: ${config.primaryRpcUrl}`)
        }
      }
    } catch (error) {
      console.warn('Failed to load RPC preferences:', error)
    }
  }

  private isDefaultEndpoint(url: string): boolean {
    const defaultEndpoints = [
      process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.mainnet.near.org',
      'https://near.lava.build',
      'https://near.blockpi.network/v1/rpc/public',
      'https://rpc.shitzuapes.xyz',
    ]
    return defaultEndpoints.includes(url)
  }

  private initializeEndpoints() {
    const primaryUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.mainnet.near.org'
    const fallbackUrls = (process.env.NEXT_PUBLIC_RPC_FALLBACKS || '').split(',').filter(Boolean)
    
    // Default fallback endpoints if none provided
    const defaultFallbacks = [
      'https://near.lava.build',
      'https://near.blockpi.network/v1/rpc/public',
      'https://rpc.shitzuapes.xyz',
    ]
    
    // Add primary endpoint
    this.endpoints.push({
      url: primaryUrl,
      failures: 0,
      isBlacklisted: false
    })

    // Add custom fallback endpoints if provided, otherwise use defaults
    const fallbacks = fallbackUrls.length > 0 ? fallbackUrls : defaultFallbacks
    
    fallbacks.forEach(url => {
      const cleanUrl = url.trim()
      // Avoid duplicates
      if (!this.endpoints.some(ep => ep.url === cleanUrl)) {
        this.endpoints.push({
          url: cleanUrl,
          failures: 0,
          isBlacklisted: false
        })
      }
    })

    console.log(`Initialized RPC manager with ${this.endpoints.length} endpoints:`, 
      this.endpoints.map(ep => ep.url))
  }

  private setupProvider() {
    const currentEndpoint = this.getCurrentEndpoint()
    if (currentEndpoint) {
      console.log(`Setting up provider for: ${currentEndpoint.url}`)
      this.provider = new providers.JsonRpcProvider({
        url: currentEndpoint.url,
      })
      
      // Notify listeners of the change
      this.notifyListeners(currentEndpoint.url)
    } else {
      console.warn('No current endpoint available for provider setup')
    }
  }

  private notifyListeners(newUrl: string) {
    this.listeners.forEach(listener => {
      try {
        listener(newUrl)
      } catch (error) {
        console.error('Error notifying RPC change listener:', error)
      }
    })
  }

  addStatusChangeListener(listener: RpcStatusChangeListener) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
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

    // Enhanced rate limiting error detection
    const isRateLimit = 
      error?.message?.includes('rate') ||
      error?.message?.includes('429') ||
      error?.code === 429 ||
      error?.message?.includes('Too many requests') ||
      error?.message?.includes('rate limit') ||
      error?.message?.includes('Rate limit') ||
      error?.message?.includes('throttle') ||
      error?.message?.includes('exceeded') ||
      error?.status === 429 ||
      (error?.response && error.response.status === 429) ||
      // Check for specific NEAR RPC rate limiting responses
      error?.message?.includes('request limit') ||
      error?.message?.includes('quota exceeded') ||
      // Check for network timeout which could indicate rate limiting
      (error?.message?.includes('timeout') && currentEndpoint.failures > 0)

    // Also consider connection errors as potential rate limiting if we've had recent failures
    const isConnectionError = 
      error?.message?.includes('ECONNRESET') ||
      error?.message?.includes('ECONNREFUSED') ||
      error?.message?.includes('network') ||
      error?.code === 'ECONNRESET' ||
      error?.code === 'ECONNREFUSED'

    const shouldSwitch = isRateLimit || (isConnectionError && currentEndpoint.failures > 0)

    if (shouldSwitch) {
      console.warn(`${isRateLimit ? 'Rate limited' : 'Connection error'} on ${currentEndpoint.url}, switching...`)
      currentEndpoint.failures += 1
      currentEndpoint.lastFailure = Date.now()
      
      // Be more aggressive with blacklisting for rate limits
      if (isRateLimit || currentEndpoint.failures >= this.maxFailures) {
        currentEndpoint.isBlacklisted = true
        console.warn(`Blacklisted ${currentEndpoint.url} for ${this.blacklistDuration / 1000}s`)
      }
      
      this.switchToNextEndpoint()
    } else {
      // For other errors, still increment failures but don't switch immediately
      currentEndpoint.failures += 1
      currentEndpoint.lastFailure = Date.now()
      
      if (currentEndpoint.failures >= this.maxFailures) {
        currentEndpoint.isBlacklisted = true
        console.warn(`Blacklisted ${currentEndpoint.url} after ${this.maxFailures} failures`)
        this.switchToNextEndpoint()
      }
    }
  }

  async makeRequest<T>(requestFn: (provider: providers.JsonRpcProvider) => Promise<T>): Promise<T> {
    if (!this.provider) {
      throw new Error('No RPC provider available')
    }

    const maxRetries = Math.min(this.endpoints.length, 5) // Limit to 5 retries max
    let lastError: any
    let attemptCount = 0

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      attemptCount++
      
      try {
        console.log(`RPC request attempt ${attemptCount} using ${this.getCurrentUrl()}`)
        const result = await requestFn(this.provider)
        
        // If successful, reset failure count for current endpoint
        const currentEndpoint = this.getCurrentEndpoint()
        if (currentEndpoint && currentEndpoint.failures > 0) {
          console.log(`Request succeeded, resetting failure count for ${currentEndpoint.url}`)
          currentEndpoint.failures = 0
        }
        
        return result
      } catch (error) {
        console.warn(`RPC request failed on attempt ${attemptCount}:`, error)
        lastError = error
        
        // Handle the failure and potentially switch endpoints
        this.handleFailure(error)
        
        // If we have more attempts and this was a rate limit or connection error, continue with next endpoint
        if (attempt < maxRetries - 1) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000) // Exponential backoff, max 5s
          console.log(`Waiting ${waitTime}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }

    // If all attempts failed, throw the last error
    const errorMessage = lastError?.message || 'Unknown RPC error'
    console.error(`All ${maxRetries} RPC attempts failed. Last error: ${errorMessage}`)
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
        lastFailure: ep.lastFailure,
        isDefault: this.isDefaultEndpoint(ep.url)
      }))
    }
  }

  addCustomEndpoint(url: string, makeItPrimary: boolean = false): boolean {
    const cleanUrl = url.trim()
    
    // Validate URL format
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      console.warn('Invalid RPC URL format')
      return false
    }

    // Check if endpoint already exists
    if (this.endpoints.some(ep => ep.url === cleanUrl)) {
      console.warn('RPC endpoint already exists')
      // If it exists and we want to make it primary, just switch to it
      if (makeItPrimary) {
        return this.setCurrentEndpoint(cleanUrl)
      }
      return false
    }

    // Add the new endpoint
    const newEndpoint: RpcEndpoint = {
      url: cleanUrl,
      failures: 0,
      isBlacklisted: false
    }

    if (makeItPrimary) {
      // Insert at the beginning to make it primary
      this.endpoints.unshift(newEndpoint)
      this.currentIndex = 0
      this.setupProvider()
      console.log(`Added and switched to new primary RPC endpoint: ${cleanUrl}`)
    } else {
      // Add to the end
      this.endpoints.push(newEndpoint)
      console.log(`Added new RPC endpoint: ${cleanUrl}`)
    }

    // Save user preferences
    this.saveUserPreferences()

    return true
  }

  removeEndpoint(url: string): boolean {
    const index = this.endpoints.findIndex(ep => ep.url === url)
    if (index === -1) {
      console.warn(`Endpoint ${url} not found`)
      return false
    }

    // Don't allow removing the last endpoint
    if (this.endpoints.length <= 1) {
      console.warn('Cannot remove the last RPC endpoint')
      return false
    }

    // If we're removing the current endpoint, switch to another one first
    const currentEndpoint = this.getCurrentEndpoint()
    if (currentEndpoint && currentEndpoint.url === url) {
      this.switchToNextEndpoint()
    }

    // Remove the endpoint
    this.endpoints.splice(index, 1)
    
    // Adjust currentIndex if necessary
    if (this.currentIndex >= this.endpoints.length) {
      this.currentIndex = 0
    }

    console.log(`Removed RPC endpoint: ${url}`)
    
    // Save user preferences
    this.saveUserPreferences()
    
    return true
  }

  setCurrentEndpoint(url: string): boolean {
    const endpointIndex = this.endpoints.findIndex(ep => ep.url === url)
    if (endpointIndex === -1) {
      console.warn(`Endpoint ${url} not found`)
      return false
    }

    // Clear blacklist for the selected endpoint if it was blacklisted
    this.endpoints[endpointIndex].isBlacklisted = false
    this.endpoints[endpointIndex].failures = 0
    this.endpoints[endpointIndex].lastFailure = undefined

    // Set the current index to the selected endpoint in the available endpoints array
    // We need to recalculate available endpoints after clearing blacklist
    const availableEndpoints = this.endpoints.filter(ep => !ep.isBlacklisted)
    const availableIndex = availableEndpoints.findIndex(ep => ep.url === url)
    this.currentIndex = availableIndex >= 0 ? availableIndex : 0

    // Update the provider
    this.setupProvider()
    console.log(`Manually switched to RPC endpoint: ${url}`)
    
    // Save user preferences
    this.saveUserPreferences()
    
    return true
  }

  clearUserPreferences() {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('RPC user preferences cleared')
    } catch (error) {
      console.warn('Failed to clear RPC preferences:', error)
    }
  }
}

// Singleton instance
export const rpcManager = new RpcManager()
