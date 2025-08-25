// API utilities and helpers

import { API_CONFIG, ERROR_MESSAGES } from './constants'
import type { APIResponse } from '@/types/dashboard'

// Generic API error class
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Request timeout utility
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new APIError(ERROR_MESSAGES.timeoutError, 408)), timeoutMs)
    })
  ])
}

// Retry wrapper with exponential backoff
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = API_CONFIG.retryAttempts,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts
      const shouldRetry = error instanceof APIError && 
        (error.status === 429 || error.status === 503 || error.status === 504 || !error.status)
      
      if (isLastAttempt || !shouldRetry) {
        throw error
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 10000)))
    }
  }

  throw new APIError('Max retry attempts exceeded')
}

// Base fetch wrapper
export const fetchAPI = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.baseUrl}${endpoint}`
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client': 'world-freight-dashboard',
    'X-Client-Version': '2.1.0'
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }

  try {
    const response = await withTimeout(
      fetch(url, config),
      options.signal ? Infinity : API_CONFIG.timeout
    )

    // Handle different response types
    if (!response.ok) {
      let errorMessage = ERROR_MESSAGES.unknownError
      let details: any = null

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || ERROR_MESSAGES.unknownError
        details = errorData.details || errorData
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || ERROR_MESSAGES.unknownError
      }

      // Map status codes to user-friendly messages
      switch (response.status) {
        case 400:
          errorMessage = ERROR_MESSAGES.validationError
          break
        case 401:
        case 403:
          errorMessage = ERROR_MESSAGES.authError
          break
        case 429:
          errorMessage = ERROR_MESSAGES.rateLimitError
          break
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = ERROR_MESSAGES.apiError
          break
      }

      throw new APIError(errorMessage, response.status, 'HTTP_ERROR', details)
    }

    // Parse response
    const contentType = response.headers.get('content-type')
    let data: T

    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = (await response.text()) as unknown as T
    }

    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError(ERROR_MESSAGES.networkError, 0, 'NETWORK_ERROR')
    }

    throw new APIError(ERROR_MESSAGES.unknownError, 0, 'UNKNOWN_ERROR', error)
  }
}

// GET request helper
export const getAPI = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> => {
  return fetchAPI<T>(endpoint, {
    ...options,
    method: 'GET'
  })
}

// POST request helper
export const postAPI = async <T = any>(
  endpoint: string,
  data?: any,
  options: RequestInit = {}
): Promise<APIResponse<T>> => {
  return fetchAPI<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  })
}

// PUT request helper
export const putAPI = async <T = any>(
  endpoint: string,
  data?: any,
  options: RequestInit = {}
): Promise<APIResponse<T>> => {
  return fetchAPI<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined
  })
}

// DELETE request helper
export const deleteAPI = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> => {
  return fetchAPI<T>(endpoint, {
    ...options,
    method: 'DELETE'
  })
}

// Batch request utility
export const batchAPI = async <T = any>(
  requests: Array<{
    endpoint: string
    options?: RequestInit
  }>
): Promise<APIResponse<T[]>> => {
  try {
    const promises = requests.map(({ endpoint, options }) => 
      fetchAPI<T>(endpoint, options).catch(error => ({ error }))
    )

    const results = await Promise.all(promises)
    const successfulResults: T[] = []
    const errors: APIError[] = []

    results.forEach((result, index) => {
      if ('error' in result) {
        errors.push(new APIError(
          `Request ${index + 1} failed: ${result.error.message}`,
          result.error.status,
          result.error.code
        ))
      } else if (result.success && result.data) {
        successfulResults.push(result.data)
      }
    })

    return {
      success: errors.length === 0,
      data: successfulResults,
      error: errors.length > 0 ? errors.map(e => e.message).join('; ') : undefined,
      timestamp: new Date().toISOString(),
      metadata: {
        total: requests.length,
        successful: successfulResults.length,
        failed: errors.length
      }
    }
  } catch (error) {
    throw new APIError('Batch request failed', 0, 'BATCH_ERROR', error)
  }
}

// Request with retry utility
export const fetchWithRetry = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  maxAttempts: number = API_CONFIG.retryAttempts
): Promise<APIResponse<T>> => {
  return withRetry(() => fetchAPI<T>(endpoint, options), maxAttempts)
}

// Rate-limited request queue
class RateLimitedQueue {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private requestCount = 0
  private windowStart = Date.now()

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      if (!this.processing) {
        this.process()
      }
    })
  }

  private async process(): Promise<void> {
    this.processing = true

    while (this.queue.length > 0) {
      // Reset window if needed
      const now = Date.now()
      if (now - this.windowStart > API_CONFIG.rateLimitWindow) {
        this.requestCount = 0
        this.windowStart = now
      }

      // Wait if rate limit is exceeded
      if (this.requestCount >= API_CONFIG.maxRequestsPerWindow) {
        const waitTime = API_CONFIG.rateLimitWindow - (now - this.windowStart)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }

      // Process next request
      const request = this.queue.shift()
      if (request) {
        this.requestCount++
        try {
          await request()
        } catch (error) {
          console.error('Rate-limited request failed:', error)
        }
      }
    }

    this.processing = false
  }
}

export const rateLimitedQueue = new RateLimitedQueue()

// Utility functions for common operations
export const formatError = (error: unknown): string => {
  if (error instanceof APIError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return ERROR_MESSAGES.unknownError
}

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof APIError && error.code === 'NETWORK_ERROR'
}

export const isRateLimitError = (error: unknown): boolean => {
  return error instanceof APIError && (error.status === 429 || error.code === 'RATE_LIMIT')
}

export const isServerError = (error: unknown): boolean => {
  return error instanceof APIError && error.status !== undefined && error.status >= 500
}

// Health check utility
export const healthCheck = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: Record<string, boolean>
  responseTime: number
}> => {
  const startTime = Date.now()
  const services: Record<string, boolean> = {}

  try {
    // Check main API
    await fetchAPI('/health', { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    services.api = true
  } catch {
    services.api = false
  }

  // Check ADUANAPP (if configured)
  try {
    if (process.env.NEXT_PUBLIC_ADUANAPP_API_KEY) {
      await fetchAPI(`${process.env.NEXT_PUBLIC_ADUANAPP_API_URL}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADUANAPP_API_KEY}`
        },
        signal: AbortSignal.timeout(5000)
      })
      services.aduanapp = true
    }
  } catch {
    services.aduanapp = false
  }

  const responseTime = Date.now() - startTime
  const healthyCount = Object.values(services).filter(Boolean).length
  const totalCount = Object.keys(services).length

  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (healthyCount === totalCount) {
    status = 'healthy'
  } else if (healthyCount > 0) {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }

  return {
    status,
    services,
    responseTime
  }
}