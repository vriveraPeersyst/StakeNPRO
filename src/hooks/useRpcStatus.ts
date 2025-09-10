'use client'

import { useState, useEffect } from 'react'
import { rpcManager } from '@/lib/rpcManager'

export function useRpcStatus() {
  const [currentUrl, setCurrentUrl] = useState(rpcManager.getCurrentUrl())
  const [status, setStatus] = useState(rpcManager.getStatus())

  useEffect(() => {
    const updateStatus = () => {
      setStatus(rpcManager.getStatus())
      setCurrentUrl(rpcManager.getCurrentUrl())
    }

    // Listen for RPC changes
    const unsubscribe = rpcManager.addStatusChangeListener((newUrl) => {
      console.log('RPC changed to:', newUrl)
      setCurrentUrl(newUrl)
      setStatus(rpcManager.getStatus())
    })

    // Update status periodically
    const interval = setInterval(updateStatus, 10000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const switchRpc = (url: string) => {
    return rpcManager.setCurrentEndpoint(url)
  }

  const addCustomRpc = (url: string, makeItPrimary: boolean = false) => {
    return rpcManager.addCustomEndpoint(url, makeItPrimary)
  }

  const removeRpc = (url: string) => {
    return rpcManager.removeEndpoint(url)
  }

  const clearPreferences = () => {
    rpcManager.clearUserPreferences()
    // Force a page reload to reset to defaults
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return {
    currentUrl,
    status,
    switchRpc,
    addCustomRpc,
    removeRpc,
    clearPreferences
  }
}
