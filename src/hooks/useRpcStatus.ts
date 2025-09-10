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

  return {
    currentUrl,
    status,
    switchRpc
  }
}
