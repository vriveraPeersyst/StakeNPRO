/**
 * Format a number with thousand separators (comma) and decimal separator (dot)
 * @param value - The number to format
 * @param decimals - Maximum number of decimal places (default: 2)
 * @returns Formatted string with thousand separators
 */
export const formatNumber = (value: number | string, decimals: number = 2): string => {
  if (value === null || value === undefined || value === '') return '0';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0';
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
};

/**
 * Copy text to clipboard with fallback for environments without clipboard API
 * @param text - The text to copy to clipboard
 * @returns Promise<boolean> - Returns true if successful, false if failed
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Check if clipboard API is available (requires HTTPS or localhost)
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for environments without clipboard API or HTTP connections
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      return successful
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}

/**
 * Format a NEAR account ID for display (truncate if too long)
 * @param accountId - The full account ID
 * @param maxLength - Maximum length before truncating
 * @returns Formatted account ID string
 */
export const formatAccountId = (accountId: string, maxLength: number = 20): string => {
  if (accountId.length <= maxLength) return accountId
  const start = Math.floor(maxLength * 0.6)
  const end = maxLength - start - 3 // 3 for "..."
  return `${accountId.slice(0, start)}...${accountId.slice(-end)}`
}

/**
 * Check if the current environment supports clipboard API
 * @returns boolean
 */
export const isClipboardSupported = (): boolean => {
  return !!(navigator?.clipboard?.writeText)
}

/**
 * Format NPRO amount from yoctoNPRO (24 decimals) to NPRO with exactly 4 decimal places
 * @param yoctoAmount - The raw amount in yoctoNPRO (24 decimals)
 * @returns string - Formatted NPRO amount with 4 decimals
 */
export const formatNproAmount4Decimals = (yoctoAmount: string | number): string => {
  if (!yoctoAmount || yoctoAmount === '0') {
    return '0.0000'
  }

  try {
    const amountStr = String(yoctoAmount)
    
    // Convert from yoctoNPRO (24 decimals) to NPRO
    const divisor = Math.pow(10, 24)
    const nproAmount = parseFloat(amountStr) / divisor
    
    return nproAmount.toFixed(4)
  } catch (error) {
    console.warn('Error formatting NPRO amount:', error)
    return '0.0000'
  }
}

/**
 * Format NPRO amount from yoctoNPRO (24 decimals) to NPRO
 * @param yoctoAmount - The raw amount in yoctoNPRO (24 decimals)
 * @returns string - Formatted NPRO amount
 */
export const formatNproAmount = (yoctoAmount: string | number): string => {
  if (!yoctoAmount || yoctoAmount === 'No data') {
    return yoctoAmount as string
  }

  try {
    // Convert to string and handle scientific notation
    const amountStr = String(yoctoAmount)
    
    // If it's already a small decimal number, return as is
    if (parseFloat(amountStr) < 1000) {
      return parseFloat(amountStr).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
      })
    }

    // Convert from yoctoNPRO (24 decimals) to NPRO
    const divisor = Math.pow(10, 24)
    const nproAmount = parseFloat(amountStr) / divisor
    
    return nproAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    })
  } catch (error) {
    console.warn('Error formatting NPRO amount:', error)
    return '0'
  }
}
