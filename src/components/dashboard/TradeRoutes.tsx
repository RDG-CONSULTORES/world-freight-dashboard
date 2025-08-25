'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Route, 
  TrendingUp, 
  TrendingDown, 
  Plane, 
  DollarSign, 
  Package, 
  Clock, 
  Filter,
  ArrowUpDown,
  BarChart3,
  MapPin,
  Activity,
  Zap
} from 'lucide-react'

import { TradeRoute } from '@/types/dashboard'

// Mock data generator
const generateMockRoutes = (): TradeRoute[] => {
  const cities = [
    { name: 'Los Angeles', code: 'LAX', country: 'USA' },
    { name: 'New York', code: 'JFK', country: 'USA' },
    { name: 'London', code: 'LHR', country: 'UK' },
    { name: 'Frankfurt', code: 'FRA', country: 'Germany' },
    { name: 'Tokyo', code: 'NRT', country: 'Japan' },
    { name: 'Singapore', code: 'SIN', country: 'Singapore' },
    { name: 'Dubai', code: 'DXB', country: 'UAE' },
    { name: 'Hong Kong', code: 'HKG', country: 'China' },
    { name: 'São Paulo', code: 'GRU', country: 'Brazil' },
    { name: 'Sydney', code: 'SYD', country: 'Australia' },
  ]

  const routes: TradeRoute[] = []
  
  for (let i = 0; i < 15; i++) {
    const origin = cities[Math.floor(Math.random() * cities.length)]
    let destination = cities[Math.floor(Math.random() * cities.length)]
    
    // Ensure origin and destination are different
    while (destination.code === origin.code) {
      destination = cities[Math.floor(Math.random() * cities.length)]
    }

    const distance = Math.floor(Math.random() * 12000) + 1000 // 1000-13000 km
    const frequency = Math.floor(Math.random() * 20) + 5 // 5-25 flights per week
    const capacity = Math.floor(Math.random() * 500) + 100 // 100-600 tons per week
    const utilization = Math.random() * 40 + 60 // 60-100%
    const revenue = Math.floor(Math.random() * 5000000) + 1000000 // $1M-6M per week

    routes.push({
      id: `${origin.code}-${destination.code}`,
      origin: {
        id: origin.code,
        code: origin.code,
        icao: origin.code + 'I',
        name: `${origin.name} International`,
        city: origin.name,
        country: origin.country,
        coordinates: { latitude: 0, longitude: 0 }, // Mock coordinates
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
        id: destination.code,
        code: destination.code,
        icao: destination.code + 'I',
        name: `${destination.name} International`,
        city: destination.name,
        country: destination.country,
        coordinates: { latitude: 0, longitude: 0 }, // Mock coordinates
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
      distance,
      averageFlightTime: Math.floor(distance / 10) + 60, // Rough calculation
      frequency,
      capacity,
      utilization,
      revenue,
      profitability: Math.random() * 30 + 10, // 10-40%
      trends: {
        volume: {
          direction: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          percentage: Math.random() * 20 + 2,
          period: 'weekly'
        },
        revenue: {
          direction: Math.random() > 0.5 ? 'up' : Math.random() > 0.2 ? 'stable' : 'down',
          percentage: Math.random() * 15 + 1,
          period: 'weekly'
        },
        efficiency: {
          direction: Math.random() > 0.4 ? 'up' : Math.random() > 0.2 ? 'stable' : 'down',
          percentage: Math.random() * 10 + 1,
          period: 'weekly'
        }
      },
      seasonality: Array.from({ length: 12 }, (_, month) => ({
        month: month + 1,
        volumeMultiplier: 0.8 + Math.random() * 0.4,
        revenueMultiplier: 0.9 + Math.random() * 0.3
      }))
    })
  }

  return routes.sort((a, b) => b.revenue - a.revenue)
}

const RouteCard = ({ 
  route, 
  index, 
  isExpanded, 
  onToggle 
}: { 
  route: TradeRoute
  index: number
  isExpanded: boolean
  onToggle: () => void
}) => {
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-3 h-3" />
      case 'down': return <TrendingDown className="w-3 h-3" />
      default: return <ArrowUpDown className="w-3 h-3" />
    }
  }

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }

  const getProfitabilityColor = (profitability: number) => {
    if (profitability >= 25) return 'text-green-400 bg-green-400/20'
    if (profitability >= 15) return 'text-yellow-400 bg-yellow-400/20'
    return 'text-red-400 bg-red-400/20'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="glow-border rounded-lg glass overflow-hidden hover-glow cursor-pointer"
      onClick={onToggle}
    >
      {/* Main Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-blue-400">{route.origin.code}</span>
              <Plane className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-mono text-blue-400">{route.destination.code}</span>
            </div>
            <div className="text-xs text-gray-500">
              {route.origin.country} → {route.destination.country}
            </div>
          </div>
          
          <div className={`px-2 py-1 rounded text-xs font-medium ${getProfitabilityColor(route.profitability)}`}>
            {route.profitability.toFixed(1)}% profit
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {route.frequency}
            </div>
            <div className="text-xs text-gray-400">flights/week</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {formatCurrency(route.revenue)}
            </div>
            <div className="text-xs text-gray-400">weekly revenue</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">
              {route.utilization.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">utilization</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">
              {(route.distance / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-gray-400">km distance</div>
          </div>
        </div>

        {/* Trends */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1 ${getTrendColor(route.trends.volume.direction)}`}>
              {getTrendIcon(route.trends.volume.direction)}
              <span className="text-xs">Volume {route.trends.volume.percentage.toFixed(0)}%</span>
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor(route.trends.revenue.direction)}`}>
              {getTrendIcon(route.trends.revenue.direction)}
              <span className="text-xs">Revenue {route.trends.revenue.percentage.toFixed(0)}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="pulse-dot w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-400">Live</span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10 bg-black/20"
          >
            <div className="p-4 space-y-4">
              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Performance Metrics
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Capacity:</span>
                      <span className="text-white">{route.capacity} tons/week</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Flight Time:</span>
                      <span className="text-white">{Math.floor(route.averageFlightTime / 60)}h {route.averageFlightTime % 60}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Revenue/Flight:</span>
                      <span className="text-white">{formatCurrency(route.revenue / route.frequency)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Efficiency Trends
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Efficiency</span>
                      <div className={`flex items-center gap-1 ${getTrendColor(route.trends.efficiency.direction)}`}>
                        {getTrendIcon(route.trends.efficiency.direction)}
                        <span className="text-sm">{route.trends.efficiency.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Airport Details */}
              <div>
                <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Airport Performance
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-black/20 p-3 rounded">
                    <div className="font-medium text-blue-400 mb-2">
                      {route.origin.name} ({route.origin.code})
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Turn Time:</span>
                        <span className="text-white">{route.origin.performance.hubTurnTime.toFixed(0)}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">On-Time:</span>
                        <span className="text-white">{route.origin.performance.onTimePerformance.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 p-3 rounded">
                    <div className="font-medium text-blue-400 mb-2">
                      {route.destination.name} ({route.destination.code})
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Turn Time:</span>
                        <span className="text-white">{route.destination.performance.hubTurnTime.toFixed(0)}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">On-Time:</span>
                        <span className="text-white">{route.destination.performance.onTimePerformance.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const TradeRoutes = () => {
  const [routes, setRoutes] = useState<TradeRoute[]>(generateMockRoutes())
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'revenue' | 'utilization' | 'profitability'>('revenue')
  const [filterBy, setFilterBy] = useState<'all' | 'profitable' | 'underperforming'>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Update data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true)
      setTimeout(() => {
        setRoutes(generateMockRoutes())
        setIsLoading(false)
      }, 500)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  // Filter and sort routes
  const filteredAndSortedRoutes = routes
    .filter(route => {
      switch (filterBy) {
        case 'profitable': return route.profitability >= 20
        case 'underperforming': return route.profitability < 15
        default: return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'utilization': return b.utilization - a.utilization
        case 'profitability': return b.profitability - a.profitability
        default: return b.revenue - a.revenue
      }
    })

  const totalRevenue = routes.reduce((sum, route) => sum + route.revenue, 0)
  const avgUtilization = routes.reduce((sum, route) => sum + route.utilization, 0) / routes.length
  const totalFlights = routes.reduce((sum, route) => sum + route.frequency, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
            <Route className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Trade Routes</h2>
            <p className="text-sm text-gray-400">Performance analysis and optimization</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-sm text-blue-400"
            >
              <Zap className="w-4 h-4 animate-pulse" />
              Updating...
            </motion.div>
          )}
          
          {/* Filters */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-1.5 bg-black/30 border border-white/20 rounded text-sm text-white focus:outline-none focus:border-blue-400"
          >
            <option value="all">All Routes</option>
            <option value="profitable">High Profit (≥20%)</option>
            <option value="underperforming">Underperforming (&lt;15%)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-black/30 border border-white/20 rounded text-sm text-white focus:outline-none focus:border-blue-400"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="utilization">Sort by Utilization</option>
            <option value="profitability">Sort by Profitability</option>
          </select>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glow-border p-6 rounded-xl glass"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              ${(totalRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-400">Weekly Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {avgUtilization.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Avg Utilization</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {totalFlights}
            </div>
            <div className="text-sm text-gray-400">Weekly Flights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {filteredAndSortedRoutes.length}
            </div>
            <div className="text-sm text-gray-400">Active Routes</div>
          </div>
        </div>
      </motion.div>

      {/* Routes List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredAndSortedRoutes.map((route, index) => (
            <RouteCard
              key={route.id}
              route={route}
              index={index}
              isExpanded={expandedRoute === route.id}
              onToggle={() => setExpandedRoute(
                expandedRoute === route.id ? null : route.id
              )}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredAndSortedRoutes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-400"
        >
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No routes match the current filters.</p>
        </motion.div>
      )}
    </div>
  )
}

export default TradeRoutes