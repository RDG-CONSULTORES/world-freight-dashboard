'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Activity,
  Database,
  Shield,
  Search,
  FileText,
  Cpu,
  BarChart3,
  Timer,
  Target,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

import { AduanappService, AduanappMetrics } from '@/types/dashboard'

// Mock data generator
const generateMockAduanappData = (): AduanappMetrics => ({
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
    },
    {
      id: 'multi-classifier',
      name: 'Multi Classifier',
      description: 'Batch processing classification',
      status: Math.random() > 0.05 ? 'active' : 'maintenance',
      requests: {
        total: Math.floor(Math.random() * 5000) + 25000,
        successful: Math.floor(Math.random() * 4800) + 24000,
        failed: Math.floor(Math.random() * 200) + 50,
        avgResponseTime: Math.random() * 500 + 300
      },
      accuracy: Math.random() * 3 + 96,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'sat-search',
      name: 'SAT Search',
      description: 'Mexican tax code lookup',
      status: 'active',
      requests: {
        total: Math.floor(Math.random() * 8000) + 35000,
        successful: Math.floor(Math.random() * 7500) + 33000,
        failed: Math.floor(Math.random() * 300) + 80,
        avgResponseTime: Math.random() * 100 + 80
      },
      accuracy: Math.random() * 2 + 98,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'merceology',
      name: 'Merceology',
      description: 'Advanced classification analysis',
      status: 'active',
      requests: {
        total: Math.floor(Math.random() * 3000) + 15000,
        successful: Math.floor(Math.random() * 2800) + 14500,
        failed: Math.floor(Math.random() * 150) + 30,
        avgResponseTime: Math.random() * 800 + 400
      },
      accuracy: Math.random() * 4 + 94,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'product-validator',
      name: 'Product Validator',
      description: 'Description validation service',
      status: Math.random() > 0.15 ? 'active' : 'degraded',
      requests: {
        total: Math.floor(Math.random() * 6000) + 20000,
        successful: Math.floor(Math.random() * 5700) + 19000,
        failed: Math.floor(Math.random() * 250) + 60,
        avgResponseTime: Math.random() * 300 + 200
      },
      accuracy: Math.random() * 6 + 92,
      lastUpdated: new Date().toISOString()
    }
  ],
  totalClassifications: 0,
  processingTime: {
    average: 0,
    p95: 0,
    p99: 0
  },
  accuracy: {
    overall: 0,
    byService: {}
  },
  costPerOperation: Math.random() * 0.02 + 0.08,
  trends: {
    volume: { direction: 'up', percentage: Math.random() * 20 + 5, period: 'daily' },
    accuracy: { direction: 'stable', percentage: Math.random() * 2 + 0.5, period: 'daily' },
    performance: { direction: 'up', percentage: Math.random() * 8 + 2, period: 'daily' }
  },
  uptime: Math.random() * 2 + 98
})

const ServiceCard = ({ service, delay }: { service: AduanappService, delay: number }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-green-100'
      case 'degraded': return 'bg-yellow-500 text-yellow-100'
      case 'maintenance': return 'bg-blue-500 text-blue-100'
      case 'offline': return 'bg-red-500 text-red-100'
      default: return 'bg-gray-500 text-gray-100'
    }
  }

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'uni-classifier': return <Target className="w-5 h-5" />
      case 'multi-classifier': return <Database className="w-5 h-5" />
      case 'sat-search': return <Search className="w-5 h-5" />
      case 'merceology': return <BarChart3 className="w-5 h-5" />
      case 'product-validator': return <FileText className="w-5 h-5" />
      default: return <Cpu className="w-5 h-5" />
    }
  }

  const successRate = (service.requests.successful / service.requests.total) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className="glow-border p-4 rounded-lg glass hover-glow group cursor-pointer"
      whileHover={{ scale: 1.02 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
            {getServiceIcon(service.id)}
          </div>
          <div>
            <h4 className="font-semibold text-white">{service.name}</h4>
            <p className="text-xs text-gray-400">{service.description}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
          {service.status}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">
            {(service.requests.total / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-gray-400">Requests</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">
            {service.accuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Accuracy</div>
        </div>
      </div>

      {/* Response Time */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">Response Time</span>
          <span className="text-xs font-medium text-white">
            {service.requests.avgResponseTime.toFixed(0)}ms
          </span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(20, 100 - (service.requests.avgResponseTime / 10))}%` }}
            transition={{ delay: delay * 0.1 + 0.3, duration: 1 }}
          />
        </div>
      </div>

      {/* Success Rate */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">Success Rate</span>
          <span className="text-xs font-medium text-white">
            {successRate.toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              successRate >= 99 ? 'bg-green-500' : 
              successRate >= 95 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${successRate}%` }}
            transition={{ delay: delay * 0.1 + 0.5, duration: 1 }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-white/10">
        <div className="text-xs text-gray-500">
          Updated {new Date(service.lastUpdated).toLocaleTimeString()}
        </div>
        <div className="pulse-dot w-1.5 h-1.5 bg-green-400 rounded-full"></div>
      </div>
    </motion.div>
  )
}

const TrendIndicator = ({ 
  trend, 
  label 
}: { 
  trend: { direction: 'up' | 'down' | 'stable', percentage: number }, 
  label: string 
}) => {
  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up': return <ArrowUp className="w-4 h-4" />
      case 'down': return <ArrowDown className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
  }

  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up': return 'text-green-400 bg-green-400/10'
      case 'down': return 'text-red-400 bg-red-400/10'
      default: return 'text-yellow-400 bg-yellow-400/10'
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
      <span className="text-sm text-gray-300">{label}</span>
      <div className={`flex items-center gap-1 px-2 py-1 rounded ${getTrendColor()}`}>
        {getTrendIcon()}
        <span className="text-sm font-medium">{trend.percentage.toFixed(1)}%</span>
      </div>
    </div>
  )
}

const AduanappPanel = () => {
  const [data, setData] = useState<AduanappMetrics>(generateMockAduanappData())
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Calculate aggregated metrics
  useEffect(() => {
    const totalRequests = data.services.reduce((sum, service) => sum + service.requests.total, 0)
    const totalSuccessful = data.services.reduce((sum, service) => sum + service.requests.successful, 0)
    const avgResponseTime = data.services.reduce((sum, service) => sum + service.requests.avgResponseTime, 0) / data.services.length
    const avgAccuracy = data.services.reduce((sum, service) => sum + service.accuracy, 0) / data.services.length

    setData(prev => ({
      ...prev,
      totalClassifications: totalRequests,
      processingTime: {
        average: avgResponseTime,
        p95: avgResponseTime * 1.5,
        p99: avgResponseTime * 2
      },
      accuracy: {
        overall: avgAccuracy,
        byService: data.services.reduce((acc, service) => ({
          ...acc,
          [service.id]: service.accuracy
        }), {})
      }
    }))
  }, [data.services])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true)
      
      setTimeout(() => {
        setData(generateMockAduanappData())
        setLastUpdated(new Date())
        setIsLoading(false)
      }, 300)
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const activeServices = data.services.filter(s => s.status === 'active').length
  const totalServices = data.services.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">ADUANAPP AI</h2>
            <p className="text-sm text-gray-400">Customs Classification Services</p>
          </div>
        </div>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-sm text-blue-400"
          >
            <Zap className="w-4 h-4 animate-pulse" />
            Syncing...
          </motion.div>
        )}
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glow-border p-6 rounded-xl glass"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {(data.totalClassifications / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-gray-400">Daily Classifications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {data.accuracy.overall.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Overall Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {data.processingTime.average.toFixed(0)}ms
            </div>
            <div className="text-sm text-gray-400">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {data.uptime.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">System Uptime</div>
          </div>
        </div>

        {/* Service Status */}
        <div className="flex items-center justify-center mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">{activeServices} Active</span>
            </div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">{totalServices} Total Services</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Services Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Service Status
        </h3>
        <div className="grid gap-4">
          {data.services.map((service, index) => (
            <ServiceCard key={service.id} service={service} delay={index} />
          ))}
        </div>
      </motion.div>

      {/* Trends */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Performance Trends
        </h3>
        <div className="space-y-2">
          <TrendIndicator trend={data.trends.volume} label="Daily Volume" />
          <TrendIndicator trend={data.trends.accuracy} label="Accuracy Rate" />
          <TrendIndicator trend={data.trends.performance} label="Response Time" />
        </div>
      </motion.div>

      {/* CODIA Coming Soon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="glow-border p-6 rounded-xl glass bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30"
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold gradient-text">CODIA AI Engine</h3>
          </div>
          
          <p className="text-gray-300 mb-4">
            Next-generation customs intelligence platform launching soon
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="text-lg font-bold text-purple-400">99.8%</div>
              <div className="text-sm text-gray-400">Projected Accuracy</div>
            </div>
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="text-lg font-bold text-blue-400">&lt;50ms</div>
              <div className="text-sm text-gray-400">Target Response</div>
            </div>
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="text-lg font-bold text-green-400">24/7</div>
              <div className="text-sm text-gray-400">Autonomous Operation</div>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium">
            <Timer className="w-4 h-4" />
            Beta Testing Q4 2024
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        Last updated: {lastUpdated.toLocaleString()}
      </div>
    </div>
  )
}

export default AduanappPanel