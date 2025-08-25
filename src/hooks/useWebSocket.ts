'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { WebSocketMessage } from '@/types/dashboard'

interface UseWebSocketOptions {
  url?: string
  protocols?: string | string[]
  onMessage?: (data: any) => void
  onError?: (error: Event) => void
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  shouldReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  heartbeatMessage?: string | object
}

interface UseWebSocketReturn {
  socket: WebSocket | null
  isConnected: boolean
  isConnecting: boolean
  connectionState: 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'
  lastMessage: WebSocketMessage | null
  error: Event | null
  sendMessage: (message: string | object) => void
  disconnect: () => void
  reconnect: () => void
  messageHistory: WebSocketMessage[]
  clearHistory: () => void
}

export const useWebSocket = (
  initialUrl?: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
  const {
    url = initialUrl,
    protocols,
    onMessage,
    onError,
    onOpen,
    onClose,
    shouldReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
    heartbeatMessage = { type: 'heartbeat', timestamp: Date.now() }
  } = options

  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionState, setConnectionState] = useState<'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'>('CLOSED')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<Event | null>(null)
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([])
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const shouldReconnectRef = useRef(shouldReconnect)
  const urlRef = useRef(url)

  // Update refs when props change
  useEffect(() => {
    shouldReconnectRef.current = shouldReconnect
    urlRef.current = url
  }, [shouldReconnect, url])

  const clearTimeouts = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current)
    }
  }

  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval > 0) {
      heartbeatTimeoutRef.current = setTimeout(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          const message = typeof heartbeatMessage === 'string' 
            ? heartbeatMessage 
            : JSON.stringify(heartbeatMessage)
          socket.send(message)
          startHeartbeat() // Schedule next heartbeat
        }
      }, heartbeatInterval)
    }
  }, [socket, heartbeatInterval, heartbeatMessage])

  const connect = useCallback(() => {
    if (!urlRef.current) {
      console.warn('WebSocket URL is required')
      return
    }

    if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
      return
    }

    clearTimeouts()
    setIsConnecting(true)
    setError(null)

    try {
      const newSocket = new WebSocket(urlRef.current, protocols)
      
      newSocket.onopen = (event) => {
        console.log('WebSocket connected to:', urlRef.current)
        setIsConnected(true)
        setIsConnecting(false)
        setConnectionState('OPEN')
        reconnectAttemptsRef.current = 0
        
        startHeartbeat()
        onOpen?.(event)
      }

      newSocket.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(data)
          setMessageHistory(prev => [...prev.slice(-99), data]) // Keep last 100 messages
          onMessage?.(data)
        } catch (err) {
          console.warn('Failed to parse WebSocket message:', event.data)
          // Handle non-JSON messages
          const message: WebSocketMessage = {
            type: 'raw',
            data: event.data,
            timestamp: new Date().toISOString()
          }
          setLastMessage(message)
          onMessage?.(message)
        }
      }

      newSocket.onerror = (event) => {
        console.error('WebSocket error:', event)
        setError(event)
        setIsConnecting(false)
        onError?.(event)
      }

      newSocket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setIsConnected(false)
        setIsConnecting(false)
        setConnectionState('CLOSED')
        clearTimeouts()
        
        onClose?.(event)

        // Attempt reconnection if needed
        if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval * reconnectAttemptsRef.current) // Exponential backoff
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('Max reconnection attempts reached')
        }
      }

      // Update connection state based on readyState changes
      const checkState = () => {
        if (newSocket.readyState === WebSocket.CONNECTING) {
          setConnectionState('CONNECTING')
        } else if (newSocket.readyState === WebSocket.OPEN) {
          setConnectionState('OPEN')
        } else if (newSocket.readyState === WebSocket.CLOSING) {
          setConnectionState('CLOSING')
        } else {
          setConnectionState('CLOSED')
        }
      }

      // Check state periodically
      const stateInterval = setInterval(checkState, 1000)
      
      // Cleanup interval on socket change
      newSocket.addEventListener('close', () => {
        clearInterval(stateInterval)
      })

      setSocket(newSocket)
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setIsConnecting(false)
      setError(err as Event)
    }
  }, [protocols, onOpen, onMessage, onError, onClose, maxReconnectAttempts, reconnectInterval, startHeartbeat])

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false
    clearTimeouts()
    
    if (socket) {
      socket.close(1000, 'Manual disconnect')
    }
  }, [socket])

  const reconnect = useCallback(() => {
    shouldReconnectRef.current = true
    reconnectAttemptsRef.current = 0
    disconnect()
    setTimeout(connect, 100)
  }, [connect, disconnect])

  const sendMessage = useCallback((message: string | object) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message)
      socket.send(messageStr)
    } else {
      console.warn('WebSocket is not connected. Current state:', socket?.readyState)
    }
  }, [socket])

  const clearHistory = useCallback(() => {
    setMessageHistory([])
    setLastMessage(null)
  }, [])

  // Initial connection
  useEffect(() => {
    if (url) {
      connect()
    }

    // Cleanup on unmount
    return () => {
      shouldReconnectRef.current = false
      clearTimeouts()
      if (socket) {
        socket.close(1000, 'Component unmounted')
      }
    }
  }, [url, connect])

  // Handle visibility changes - reconnect when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && shouldReconnectRef.current) {
        reconnect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isConnected, reconnect])

  return {
    socket,
    isConnected,
    isConnecting,
    connectionState,
    lastMessage,
    error,
    sendMessage,
    disconnect,
    reconnect,
    messageHistory,
    clearHistory
  }
}