'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plane, 
  Clock, 
  TrendingUp, 
  Fuel, 
  DollarSign, 
  Timer, 
  Brain, 
  Shield,
  Activity,
  Package,
  Zap,
  AlertTriangle
} from 'lucide-react'

import { KPIData, DashboardState } from '@/types/dashboard'
import KPIGrid from '@/components/dashboard/KPIGrid'
import Globe3DEnhanced from '@/components/dashboard/Globe3DEnhanced'
import AduanappPanel from '@/components/dashboard/AduanappPanel'
import TradeRoutes from '@/components/dashboard/TradeRoutes'

// Mock data generator for demonstration
const generateMockKPIData = (): KPIData => ({
  activeFlights: Math.floor(Math.random() * 500) + 1200,
  aircraftUtilization: Math.random() * 4 + 8, // 8-12 hours
  loadFactor: Math.random() * 30 + 70, // 70-100%
  fuelEfficiency: Math.random() * 0.5 + 2.8, // 2.8-3.3 L/ton-km
  ratk: Math.random() * 0.15 + 0.35, // $0.35-0.50 per ton-km
  hubTurnTime: Math.random() * 30 + 45, // 45-75 minutes
  aduanappClassifications: Math.floor(Math.random() * 5000) + 15000,
  complianceScore: Math.random() * 10 + 90, // 90-100%
  onTimePerformance: Math.random() * 15 + 85, // 85-100%
  cargoThroughput: Math.random() * 2000 + 8000, // 8-10k tons/day
  revenuePerFlight: Math.random() * 50000 + 150000, // $150-200k
  costPerTonKm: Math.random() * 0.1 + 0.25, // $0.25-0.35 per ton-km
})

const KPICard = ({ 
  title, 
  value, 
  unit, 
  trend, 
  icon: Icon, 
  color,
  delay 
}: {
  title: string
  value: string | number
  unit: string
  trend: { direction: 'up' | 'down' | 'stable', percentage: number }
  icon: any
  color: string
  delay: number
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
      if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
      return val.toFixed(1)
    }
    return val
  }

  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up': return '↗'
      case 'down': return '↘'
      default: return '→'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay * 0.1, duration: 0.6 }}
      className={`glow-border p-6 rounded-xl glass hover-glow cursor-pointer group transition-all duration-300`}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className={`text-sm ${getTrendColor()} flex items-center gap-1 font-medium`}>
          <span>{getTrendIcon()}</span>
          <span>{trend.percentage.toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm text-gray-400 font-medium tracking-wide uppercase">
          {title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold gradient-text">
            {formatValue(value)}
          </span>
          <span className="text-sm text-gray-500">{unit}</span>
        </div>
      </div>

      {/* Live data indicator */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
        <div className="pulse-dot w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="text-xs text-gray-400">Live Data</span>
        <div className="text-xs text-gray-500 ml-auto">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  )
}

const ParticleField = () => {
  return (
    <div className="particles fixed inset-0 pointer-events-none z-0">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="particle absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

const SystemStatus = () => {
  const [status, setStatus] = useState('All Systems Operational')
  const [color, setColor] = useState('status-online')
  
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random()
      if (rand > 0.95) {
        setStatus('Minor Service Degradation')
        setColor('status-warning')
      } else if (rand > 0.98) {
        setStatus('System Alert')
        setColor('status-error')
      } else {
        setStatus('All Systems Operational')
        setColor('status-online')
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full border border-white/10"
    >
      <div className={`w-3 h-3 rounded-full ${color} pulse-dot`}></div>
      <span className="text-sm font-medium">{status}</span>
    </motion.div>
  )
}

export default function Dashboard() {
  const [kpiData, setKpiData] = useState<KPIData>(generateMockKPIData())
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true)
      
      setTimeout(() => {
        setKpiData(generateMockKPIData())
        setLastUpdated(new Date())
        setIsLoading(false)
      }, 500)
    }, 2500) // Update every 2.5 seconds

    return () => clearInterval(interval)
  }, [])

  const kpiCards = [
    {
      title: 'Active Flights',
      value: kpiData.activeFlights,
      unit: 'flights',
      trend: { direction: 'up' as const, percentage: Math.random() * 10 + 2 },
      icon: Plane,
      color: 'bg-blue-500'
    },
    {
      title: 'Aircraft Utilization',
      value: kpiData.aircraftUtilization,
      unit: 'hrs/day',
      trend: { direction: 'up' as const, percentage: Math.random() * 5 + 1 },
      icon: Clock,
      color: 'bg-cyan-500'
    },
    {
      title: 'Load Factor',
      value: kpiData.loadFactor,
      unit: '%',
      trend: { direction: Math.random() > 0.5 ? 'up' as const : 'down' as const, percentage: Math.random() * 8 },
      icon: Package,
      color: 'bg-green-500'
    },
    {
      title: 'Fuel Efficiency',
      value: kpiData.fuelEfficiency,
      unit: 'L/ton-km',
      trend: { direction: 'down' as const, percentage: Math.random() * 3 + 1 }, // Lower is better
      icon: Fuel,
      color: 'bg-orange-500'
    },
    {
      title: 'RATK',
      value: kpiData.ratk,
      unit: '$/ton-km',
      trend: { direction: 'up' as const, percentage: Math.random() * 12 + 3 },
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'Hub Turn Time',
      value: kpiData.hubTurnTime,
      unit: 'min',
      trend: { direction: 'down' as const, percentage: Math.random() * 6 + 2 }, // Lower is better
      icon: Timer,
      color: 'bg-purple-500'
    },
    {
      title: 'AI Classifications',
      value: kpiData.aduanappClassifications,
      unit: 'ops/day',
      trend: { direction: 'up' as const, percentage: Math.random() * 25 + 10 },
      icon: Brain,
      color: 'bg-indigo-500'
    },
    {
      title: 'Compliance Score',
      value: kpiData.complianceScore,
      unit: '%',
      trend: { direction: 'stable' as const, percentage: Math.random() * 2 + 0.5 },
      icon: Shield,
      color: 'bg-emerald-500'
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-dashboard-dark via-dashboard-darker to-dashboard-dark cyber-grid relative">
      <ParticleField />
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold gradient-text">
              World Freight Command Center
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-400">
              <span>ADUANAPP Integration Active</span>
              <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
              <span>Last Update: {lastUpdated.toLocaleTimeString()}</span>
              <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Real-time Monitoring
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <SystemStatus />
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
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-8">
        
        {/* KPI Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Key Performance Indicators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiCards.map((card, index) => (
              <KPICard key={card.title} {...card} delay={index} />
            ))}
          </div>
        </motion.section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Globe Section */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-2"
          >
            <div className="glow-border p-6 rounded-xl glass">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                🌍 Global Trade Routes
              </h3>
              <Globe3DEnhanced />
            </div>
          </motion.section>

          {/* ADUANAPP Panel */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AduanappPanel />
          </motion.section>
        </div>

        {/* Trade Routes Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <TradeRoutes />
        </motion.section>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="relative z-10 border-t border-white/10 p-6 mt-12"
      >
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>World Freight Dashboard v2.1.0 | Powered by ADUANAPP AI | Enterprise Edition</p>
        </div>
      </motion.footer>
    </main>
  )
}