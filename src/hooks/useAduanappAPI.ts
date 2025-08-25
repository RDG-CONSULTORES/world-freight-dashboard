'use client'

import { useState, useCallback, useRef } from 'react'
import { AduanappMetrics, AduanappService, AduanappClassification } from '@/types/dashboard'

interface UseAduanappAPIOptions {
  baseUrl?: string
  apiKey?: string
  timeout?: number
  retryAttempts?: number
  rateLimitWindow?: number // in milliseconds
  maxRequestsPerWindow?: number
}

interface UseAduanappAPIReturn {
  metrics: AduanappMetrics | null
  isLoading: boolean
  error: string | null
  
  // Service methods
  classifyProduct: (description: string) => Promise<AduanappClassification | null>
  classifyMultiple: (descriptions: string[]) => Promise<AduanappClassification[] | null>
  searchSAT: (query: string) => Promise<any[] | null>
  validateProduct: (description: string) => Promise<boolean | null>
  getMerceology: (hsCode: string) => Promise<any | null>
  
  // Metrics and monitoring
  refreshMetrics: () => Promise<void>
  getServiceStatus: (serviceId: string) => Promise<AduanappService | null>
  
  // Utility methods
  clearCache: () => void
  resetRateLimit: () => void
  getUsageStats: () => {
    requestsThisWindow: number
    remainingRequests: number
    windowResetTime: Date
  }
}

// Rate limiting implementation
class RateLimiter {
  private requests: number[] = []
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  canMakeRequest(): boolean {
    const now = Date.now()
    
    // Remove requests outside the current window
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    
    return this.requests.length < this.maxRequests
  }

  recordRequest(): void {
    this.requests.push(Date.now())
  }

  getRemainingRequests(): number {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    return Math.max(0, this.maxRequests - this.requests.length)
  }

  getWindowResetTime(): Date {
    if (this.requests.length === 0) return new Date()
    const oldestRequest = Math.min(...this.requests)
    return new Date(oldestRequest + this.windowMs)
  }

  reset(): void {
    this.requests = []
  }
}

// Response cache implementation
class ResponseCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }
}

export const useAduanappAPI = (
  options: UseAduanappAPIOptions = {}
): UseAduanappAPIReturn => {
  const {
    baseUrl = process.env.NEXT_PUBLIC_ADUANAPP_API_URL || 'https://api.aduanapp.com/v1',
    apiKey = process.env.NEXT_PUBLIC_ADUANAPP_API_KEY,
    timeout = 10000,
    retryAttempts = 3,
    rateLimitWindow = 60000, // 1 minute
    maxRequestsPerWindow = 100
  } = options

  const [metrics, setMetrics] = useState<AduanappMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create rate limiter and cache instances
  const rateLimiterRef = useRef(new RateLimiter(maxRequestsPerWindow, rateLimitWindow))
  const cacheRef = useRef(new ResponseCache())

  // Generic API request method
  const makeRequest = useCallback(async (
    endpoint: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<any> => {
    // Check rate limit
    if (!rateLimiterRef.current.canMakeRequest()) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    // Check cache
    if (cacheKey) {
      const cachedResponse = cacheRef.current.get(cacheKey)
      if (cachedResponse) {
        return cachedResponse
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      rateLimiterRef.current.recordRequest()

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : '',
          'X-Client': 'world-freight-dashboard',
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded')
        }
        if (response.status === 401) {
          throw new Error('Unauthorized - check API key')
        }
        if (response.status >= 500) {
          throw new Error('Service temporarily unavailable')
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Cache successful response
      if (cacheKey && cacheTTL) {
        cacheRef.current.set(cacheKey, data, cacheTTL)
      }

      return data
    } catch (err) {
      clearTimeout(timeoutId)
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`)
        }
        throw err
      }
      
      throw new Error('Unknown API error')
    }
  }, [baseUrl, apiKey, timeout])

  // Retry wrapper for failed requests
  const withRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    attempts: number = retryAttempts
  ): Promise<T> => {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation()
      } catch (err) {
        const isLastAttempt = i === attempts - 1
        const shouldRetry = err instanceof Error && 
          (err.message.includes('timeout') || err.message.includes('temporarily unavailable'))
        
        if (isLastAttempt || !shouldRetry) {
          throw err
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, i), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    throw new Error('Max retry attempts exceeded')
  }, [retryAttempts])

  // API Methods

  const classifyProduct = useCallback(async (description: string): Promise<AduanappClassification | null> => {
    if (!description.trim()) {
      throw new Error('Product description is required')
    }

    setIsLoading(true)
    setError(null)

    try {
      const cacheKey = `classify:${description.toLowerCase().trim()}`
      const result = await withRetry(() => 
        makeRequest('/classify', {
          method: 'POST',
          body: JSON.stringify({ description })
        }, cacheKey, 300000) // 5 minute cache
      )

      return {
        hsCode: result.hsCode || '',
        description: result.description || description,
        confidence: result.confidence || 0,
        alternatives: result.alternatives || [],
        processingTime: result.processingTime || 0
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Classification failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest, withRetry])

  const classifyMultiple = useCallback(async (descriptions: string[]): Promise<AduanappClassification[] | null> => {
    if (!descriptions.length) {
      throw new Error('At least one description is required')
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await withRetry(() =>
        makeRequest('/classify/batch', {
          method: 'POST',
          body: JSON.stringify({ descriptions })
        })
      )

      return result.classifications || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch classification failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest, withRetry])

  const searchSAT = useCallback(async (query: string): Promise<any[] | null> => {
    if (!query.trim()) {
      throw new Error('Search query is required')
    }

    setIsLoading(true)
    setError(null)

    try {
      const cacheKey = `sat:${query.toLowerCase().trim()}`
      const result = await withRetry(() =>
        makeRequest(`/sat/search?q=${encodeURIComponent(query)}`, {}, cacheKey, 600000) // 10 minute cache
      )

      return result.results || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SAT search failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest, withRetry])

  const validateProduct = useCallback(async (description: string): Promise<boolean | null> => {
    if (!description.trim()) {
      throw new Error('Product description is required')
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await withRetry(() =>
        makeRequest('/validate', {
          method: 'POST',
          body: JSON.stringify({ description })
        })
      )

      return result.isValid || false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest, withRetry])

  const getMerceology = useCallback(async (hsCode: string): Promise<any | null> => {
    if (!hsCode.trim()) {
      throw new Error('HS code is required')
    }

    setIsLoading(true)
    setError(null)

    try {
      const cacheKey = `merceology:${hsCode}`
      const result = await withRetry(() =>
        makeRequest(`/merceology/${encodeURIComponent(hsCode)}`, {}, cacheKey, 1800000) // 30 minute cache
      )

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Merceology lookup failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest, withRetry])

  const refreshMetrics = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await withRetry(() =>
        makeRequest('/metrics', {}, 'metrics', 30000) // 30 second cache
      )

      setMetrics(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest, withRetry])

  const getServiceStatus = useCallback(async (serviceId: string): Promise<AduanappService | null> => {
    if (!serviceId.trim()) {
      throw new Error('Service ID is required')
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await withRetry(() =>
        makeRequest(`/services/${serviceId}/status`, {}, `service:${serviceId}`, 60000) // 1 minute cache
      )

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service status'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest, withRetry])

  // Utility methods
  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  const resetRateLimit = useCallback(() => {
    rateLimiterRef.current.reset()
  }, [])

  const getUsageStats = useCallback(() => {
    return {
      requestsThisWindow: rateLimiterRef.current.getRemainingRequests(),
      remainingRequests: rateLimiterRef.current.getRemainingRequests(),
      windowResetTime: rateLimiterRef.current.getWindowResetTime()
    }
  }, [])

  return {
    metrics,
    isLoading,
    error,
    classifyProduct,
    classifyMultiple,
    searchSAT,
    validateProduct,
    getMerceology,
    refreshMetrics,
    getServiceStatus,
    clearCache,
    resetRateLimit,
    getUsageStats
  }
}