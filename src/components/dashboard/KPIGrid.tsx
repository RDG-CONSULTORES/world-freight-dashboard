'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity,
  Clock,
  AlertCircle 
} from 'lucide-react'
import { KPIData } from '@/types/dashboard'

interface KPIGridProps {
  data: KPIData
  isLoading?: boolean
  lastUpdated?: Date
}

interface KPIItemProps {
  title: string
  value: number
  unit: string
  trend?: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
  }
  target?: number
  icon: React.ComponentType<any>
  color: string
  delay: number
  format?: 'number' | 'currency' | 'percentage' | 'time'
  precision?: number
}

const formatValue = (value: number, format: string = 'number', precision: number = 1): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(value)
    
    case 'percentage':
      return `${value.toFixed(precision)}%`
    
    case 'time':
      return `${value.toFixed(0)}m`
    
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(precision)}M`
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(precision)}K`
      }
      return value.toFixed(precision)
  }
}

const getTrendIcon = (direction: string) => {
  switch (direction) {
    case 'up':
      return <TrendingUp className="w-4 h-4" />
    case 'down':
      return <TrendingDown className="w-4 h-4" />
    default:
      return <Minus className="w-4 h-4" />
  }
}

const getTrendColor = (direction: string) => {
  switch (direction) {
    case 'up':
      return 'text-green-400 bg-green-400/10'
    case 'down':
      return 'text-red-400 bg-red-400/10'
    default:
      return 'text-yellow-400 bg-yellow-400/10'
  }
}

const getProgressPercentage = (value: number, target?: number): number => {
  if (!target) return 75 + Math.random() * 20 // Mock progress if no target
  return Math.min((value / target) * 100, 100)
}

const KPIItem: React.FC<KPIItemProps> = ({
  title,
  value,
  unit,
  trend,
  target,
  icon: Icon,
  color,
  delay,
  format = 'number',
  precision = 1
}) => {
  const progress = getProgressPercentage(value, target)
  const isHealthy = progress >= 80
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: delay * 0.1, 
        duration: 0.6,
        type: "spring",
        stiffness: 100 
      }}
      className="group glow-border p-6 rounded-xl glass hover-glow cursor-pointer relative overflow-hidden"
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -right-8 -top-8">
          <Icon className="w-24 h-24 opacity-20" />
        </div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${color} bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          
          {trend && (
            <motion.div 
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getTrendColor(trend.direction)}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay * 0.1 + 0.3 }}
            >
              {getTrendIcon(trend.direction)}
              <span>{trend.percentage.toFixed(1)}%</span>
            </motion.div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-2">
          {title}
        </h3>

        {/* Value */}
        <div className="flex items-baseline gap-2 mb-4">
          <motion.span 
            className="text-3xl font-bold gradient-text"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay * 0.1 + 0.2 }}
          >
            {formatValue(value, format, precision)}
          </motion.span>
          {format !== 'currency' && format !== 'percentage' && (
            <span className="text-sm text-gray-500">{unit}</span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">Performance</span>
            <span className={`text-xs font-medium ${isHealthy ? 'text-green-400' : 'text-yellow-400'}`}>
              {progress.toFixed(0)}%
            </span>
          </div>
          
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isHealthy ? 'bg-green-400' : 'bg-yellow-400'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: delay * 0.1 + 0.5, duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="pulse-dot w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-400">Real-time</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {/* Status Indicator */}
        {!isHealthy && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay * 0.1 + 0.7 }}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center"
          >
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

const KPIGrid: React.FC<KPIGridProps> = ({ 
  data, 
  isLoading = false, 
  lastUpdated 
}) => {
  const kpiItems = [
    {
      title: 'Active Flights',
      value: data.activeFlights,
      unit: 'flights',
      trend: { direction: 'up' as const, percentage: 5.2 },
      target: 1500,
      color: 'bg-blue-500',
      format: 'number' as const
    },
    {
      title: 'Aircraft Utilization',
      value: data.aircraftUtilization,
      unit: 'hrs/day',
      trend: { direction: 'up' as const, percentage: 2.8 },
      target: 12,
      color: 'bg-cyan-500',
      format: 'number' as const,
      precision: 1
    },
    {
      title: 'Load Factor',
      value: data.loadFactor,
      unit: '%',
      trend: { direction: 'stable' as const, percentage: 1.2 },
      target: 85,
      color: 'bg-green-500',
      format: 'percentage' as const
    },
    {
      title: 'Fuel Efficiency',
      value: data.fuelEfficiency,
      unit: 'L/ton-km',
      trend: { direction: 'down' as const, percentage: 3.1 }, // Down is good for efficiency
      target: 2.5,
      color: 'bg-orange-500',
      format: 'number' as const,
      precision: 2
    },
    {
      title: 'RATK',
      value: data.ratk,
      unit: '$/ton-km',
      trend: { direction: 'up' as const, percentage: 8.7 },
      target: 0.5,
      color: 'bg-yellow-500',
      format: 'currency' as const,
      precision: 3
    },
    {
      title: 'Hub Turn Time',
      value: data.hubTurnTime,
      unit: 'minutes',
      trend: { direction: 'down' as const, percentage: 4.3 }, // Down is good
      target: 45,
      color: 'bg-purple-500',
      format: 'time' as const
    },
    {
      title: 'AI Classifications',
      value: data.aduanappClassifications,
      unit: 'ops/day',
      trend: { direction: 'up' as const, percentage: 15.6 },
      target: 25000,
      color: 'bg-indigo-500',
      format: 'number' as const
    },
    {
      title: 'Compliance Score',
      value: data.complianceScore,
      unit: '%',
      trend: { direction: 'stable' as const, percentage: 0.8 },
      target: 98,
      color: 'bg-emerald-500',
      format: 'percentage' as const
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="glow-border p-6 rounded-xl glass">
            <div className="animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                <div className="w-16 h-6 bg-gray-700 rounded"></div>
              </div>
              <div className="w-24 h-4 bg-gray-700 rounded mb-2"></div>
              <div className="w-32 h-8 bg-gray-700 rounded mb-4"></div>
              <div className="w-full h-2 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Real-time KPIs</h2>
        </div>
        
        {lastUpdated && (
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiItems.map((item, index) => (
          <KPIItem
            key={item.title}
            title={item.title}
            value={item.value}
            unit={item.unit}
            trend={item.trend}
            target={item.target}
            icon={
              // Dynamic icon mapping based on title
              item.title.includes('Flight') ? require('lucide-react').Plane :
              item.title.includes('Utilization') ? require('lucide-react').Clock :
              item.title.includes('Load') ? require('lucide-react').Package :
              item.title.includes('Fuel') ? require('lucide-react').Fuel :
              item.title.includes('RATK') ? require('lucide-react').DollarSign :
              item.title.includes('Turn') ? require('lucide-react').Timer :
              item.title.includes('AI') ? require('lucide-react').Brain :
              item.title.includes('Compliance') ? require('lucide-react').Shield :
              require('lucide-react').Activity
            }
            color={item.color}
            delay={index}
            format={item.format}
            precision={item.precision}
          />
        ))}
      </div>
    </div>
  )
}

export default KPIGrid