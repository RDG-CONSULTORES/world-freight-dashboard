'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWebSocket } from './useWebSocket'
import { 
  KPIData, 
  FlightData, 
  TradeRoute, 
  AduanappMetrics, 
  AlertSystem, 
  DashboardState,
  WebSocketMessage 
} from '@/types/dashboard'

interface UseRealTimeDataOptions {
  wsUrl?: string
  updateInterval?: number
  enableWebSocket?: boolean
  onError?: (error: string) => void
  onConnectionChange?: (connected: boolean) => void
}

interface UseRealTimeDataReturn {
  data: DashboardState
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error'
  retryConnection: () => void
  refreshData: () => void
  updateFilter: (filters: Partial<DashboardState['filters']>) => void
}

// Mock data generators for real-time simulation
const generateMockKPIData = (): KPIData => ({
  activeFlights: Math.floor(Math.random() * 500) + 1200,
  aircraftUtilization: Math.random() * 4 + 8,
  loadFactor: Math.random() * 30 + 70,
  fuelEfficiency: Math.random() * 0.5 + 2.8,
  ratk: Math.random() * 0.15 + 0.35,
  hubTurnTime: Math.random() * 30 + 45,
  aduanappClassifications: Math.floor(Math.random() * 5000) + 15000,
  complianceScore: Math.random() * 10 + 90,
  onTimePerformance: Math.random() * 15 + 85,
  cargoThroughput: Math.random() * 2000 + 8000,
  revenuePerFlight: Math.random() * 50000 + 150000,
  costPerTonKm: Math.random() * 0.1 + 0.25,
})

const generateMockFlights = (): FlightData[] => {
  const flights: FlightData[] = []
  const routes = [
    { from: 'LAX', to: 'JFK' },
    { from: 'LHR', to: 'FRA' },
    { from: 'NRT', to: 'SIN' },
    { from: 'DXB', to: 'HKG' },
    { from: 'GRU', to: 'SYD' }
  ]

  for (let i = 0; i < 50; i++) {
    const route = routes[Math.floor(Math.random() * routes.length)]
    flights.push({
      id: `FL${1000 + i}`,
      flightNumber: `WF${1000 + i}`,
      origin: {
        id: route.from,
        code: route.from,
        icao: route.from + 'I',
        name: `${route.from} International`,
        city: route.from,
        country: 'Unknown',
        coordinates: { latitude: 0, longitude: 0 },
        timezone: 'UTC',
        performance: {
          hubTurnTime: Math.random() * 30 + 45,
          onTimePerformance: Math.random() * 15 + 85,
          cargoThroughput: Math.random() * 2000 + 5000,
          utilizationRate: Math.random() * 20 + 80,
          efficiency: Math.random() * 15 + 85,
          capacity: {
            current: Math.random() * 8000 + 2000,
            maximum: 10000,
            available: Math.random() * 2000 + 1000
          }
        }
      },
      destination: {
        id: route.to,
        code: route.to,
        icao: route.to + 'I',
        name: `${route.to} International`,
        city: route.to,
        country: 'Unknown',
        coordinates: { latitude: 0, longitude: 0 },
        timezone: 'UTC',
        performance: {
          hubTurnTime: Math.random() * 30 + 45,
          onTimePerformance: Math.random() * 15 + 85,
          cargoThroughput: Math.random() * 2000 + 5000,
          utilizationRate: Math.random() * 20 + 80,
          efficiency: Math.random() * 15 + 85,
          capacity: {
            current: Math.random() * 8000 + 2000,
            maximum: 10000,
            available: Math.random() * 2000 + 1000
          }
        }
      },
      aircraft: {
        id: `AC${100 + i}`,
        type: 'Cargo',
        model: ['Boeing 747-8F', 'Airbus A330-200F', 'Boeing 777F'][Math.floor(Math.random() * 3)],
        registration: `N${10000 + i}WF`,
        capacity: {
          maxWeight: Math.floor(Math.random() * 50000) + 100000,
          maxVolume: Math.floor(Math.random() * 500) + 500,
        },
        utilization: {
          hoursPerDay: Math.random() * 4 + 8,
          efficiency: Math.random() * 20 + 80
        },
        fuelConsumption: {
          litersPerHour: Math.random() * 1000 + 2000,
          efficiency: Math.random() * 0.5 + 2.8
        }
      },
      departureTime: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      arrivalTime: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000).toISOString(),
      status: ['scheduled', 'in-flight', 'delayed', 'landed'][Math.floor(Math.random() * 4)] as any,
      cargo: {
        totalWeight: Math.floor(Math.random() * 80000) + 20000,
        totalVolume: Math.floor(Math.random() * 400) + 100,
        loadFactor: Math.random() * 30 + 70,
        commodities: [],
        hazardous: Math.random() > 0.8
      },
      route: []
    })
  }

  return flights
}

const generateMockAduanapp = (): AduanappMetrics => ({
  services: [
    {
      id: 'uni-classifier',
      name: 'Uni Classifier',
      description: 'Single product classification',
      status: Math.random() > 0.1 ? 'active' : 'degraded',
      requests: {
        total: Math.floor(Math.random() * 10000) + 50000,
        successful: Math.floor(Math.random() * 9500) + 47000,
        failed: Math.floor(Math.random() * 500) + 100,
        avgResponseTime: Math.random() * 200 + 150
      },
      accuracy: Math.random() * 5 + 95,
      lastUpdated: new Date().toISOString()
    }
  ],
  totalClassifications: Math.floor(Math.random() * 100000) + 500000,
  processingTime: {
    average: Math.random() * 200 + 150,
    p95: Math.random() * 400 + 300,
    p99: Math.random() * 800 + 600
  },
  accuracy: {
    overall: Math.random() * 5 + 95,
    byService: {
      'uni-classifier': Math.random() * 5 + 95
    }
  },
  costPerOperation: Math.random() * 0.02 + 0.08,
  trends: {
    volume: { direction: 'up', percentage: Math.random() * 20 + 5, period: 'daily' },
    accuracy: { direction: 'stable', percentage: Math.random() * 2 + 0.5, period: 'daily' },
    performance: { direction: 'up', percentage: Math.random() * 8 + 2, period: 'daily' }
  },
  uptime: Math.random() * 2 + 98
})

const generateMockAlerts = (): AlertSystem => ({
  alerts: [
    {
      id: 'alert1',
      type: 'operational',
      severity: 'warning',
      title: 'High Hub Turn Time',
      description: 'LAX hub turn time exceeding 75 minutes',
      timestamp: new Date().toISOString(),
      source: 'Operations Monitor',
      acknowledged: false,
      resolved: false
    }
  ],
  notifications: [
    {
      id: 'notif1',
      type: 'info',
      title: 'System Update',
      message: 'Dashboard refreshed with latest data',
      timestamp: new Date().toISOString(),
      read: false
    }
  ],
  systemHealth: {
    overall: 'healthy',
    components: [
      {
        name: 'ADUANAPP API',
        status: 'online',
        responseTime: 150,
        errorRate: 0.01,
        lastUpdated: new Date().toISOString()
      }
    ],
    uptime: 99.8,
    lastCheck: new Date().toISOString()
  }
})

export const useRealTimeData = (
  options: UseRealTimeDataOptions = {}
): UseRealTimeDataReturn => {
  const {
    wsUrl,
    updateInterval = 2500,
    enableWebSocket = false,
    onError,
    onConnectionChange
  } = options

  const [data, setData] = useState<DashboardState>({
    isLoading: false,
    lastUpdated: new Date().toISOString(),
    filters: {
      timeRange: '24h',
      regions: [],
      commodities: [],
      routes: [],
      showPredictive: true
    },
    realTimeData: {
      kpis: generateMockKPIData(),
      flights: generateMockFlights(),
      routes: [],
      aduanapp: generateMockAduanapp(),
      alerts: generateMockAlerts()
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date())
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected')

  // WebSocket connection
  const { 
    isConnected, 
    isConnecting, 
    lastMessage, 
    sendMessage, 
    reconnect: wsReconnect,
    error: wsError 
  } = useWebSocket(
    enableWebSocket ? wsUrl : undefined,
    {
      onMessage: (message: WebSocketMessage) => {
        handleWebSocketMessage(message)
      },
      onError: (err) => {
        setError('WebSocket connection error')
        setConnectionStatus('error')
        onError?.('WebSocket connection error')
      },
      onOpen: () => {
        setError(null)
        setConnectionStatus('connected')
        onConnectionChange?.(true)
      },
      onClose: () => {
        setConnectionStatus('disconnected')
        onConnectionChange?.(false)
      }
    }
  )

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    try {
      switch (message.type) {
        case 'kpi_update':
          setData(prev => ({
            ...prev,
            realTimeData: {
              ...prev.realTimeData,
              kpis: message.data
            },
            lastUpdated: new Date().toISOString()
          }))
          break

        case 'flight_update':
          setData(prev => ({
            ...prev,
            realTimeData: {
              ...prev.realTimeData,
              flights: message.data
            },
            lastUpdated: new Date().toISOString()
          }))
          break

        case 'aduanapp_update':
          setData(prev => ({
            ...prev,
            realTimeData: {
              ...prev.realTimeData,
              aduanapp: message.data
            },
            lastUpdated: new Date().toISOString()
          }))
          break

        case 'alert':
          setData(prev => ({
            ...prev,
            realTimeData: {
              ...prev.realTimeData,
              alerts: {
                ...prev.realTimeData.alerts,
                alerts: [...prev.realTimeData.alerts.alerts, message.data]
              }
            },
            lastUpdated: new Date().toISOString()
          }))
          break

        default:
          console.log('Unknown WebSocket message type:', message.type)
      }
      
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('Error processing WebSocket message:', err)
      setError('Failed to process real-time update')
    }
  }, [])

  // Refresh data manually or via polling
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const newData: DashboardState = {
        ...data,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
        realTimeData: {
          kpis: generateMockKPIData(),
          flights: generateMockFlights(),
          routes: [],
          aduanapp: generateMockAduanapp(),
          alerts: generateMockAlerts()
        }
      }

      setData(newData)
      setLastUpdated(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [data, onError])

  // Update filters
  const updateFilter = useCallback((filters: Partial<DashboardState['filters']>) => {
    setData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters
      }
    }))
  }, [])

  // Retry connection
  const retryConnection = useCallback(() => {
    setError(null)
    if (enableWebSocket) {
      wsReconnect()
    } else {
      refreshData()
    }
  }, [enableWebSocket, wsReconnect, refreshData])

  // Update connection status based on WebSocket state
  useEffect(() => {
    if (!enableWebSocket) {
      setConnectionStatus('connected') // Assume connected when using polling
      return
    }

    if (isConnecting) {
      setConnectionStatus('connecting')
    } else if (isConnected) {
      setConnectionStatus('connected')
    } else if (wsError) {
      setConnectionStatus('error')
    } else {
      setConnectionStatus('disconnected')
    }
  }, [enableWebSocket, isConnecting, isConnected, wsError])

  // Polling fallback when WebSocket is disabled
  useEffect(() => {
    if (enableWebSocket) return

    const interval = setInterval(() => {
      refreshData()
    }, updateInterval)

    return () => clearInterval(interval)
  }, [enableWebSocket, updateInterval, refreshData])

  // Initial data load
  useEffect(() => {
    refreshData()
  }, []) // Remove refreshData from dependencies to avoid infinite loop

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    connectionStatus,
    retryConnection,
    refreshData,
    updateFilter
  }
}