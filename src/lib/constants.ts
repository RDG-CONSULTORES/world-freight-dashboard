// Application constants and configuration

export const APP_CONFIG = {
  name: 'World Freight Dashboard',
  version: '2.1.0',
  description: 'Mission-critical logistics command center with ADUANAPP integration',
  company: 'World Freight Company',
  supportEmail: 'support@worldfreight.com',
  docsUrl: 'https://docs.worldfreight.com'
} as const

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 10000,
  retryAttempts: 3,
  rateLimitWindow: 60000, // 1 minute
  maxRequestsPerWindow: 100
} as const

export const ADUANAPP_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_ADUANAPP_API_URL || 'https://api.aduanapp.com/v1',
  apiKey: process.env.NEXT_PUBLIC_ADUANAPP_API_KEY,
  timeout: 10000,
  retryAttempts: 3,
  cacheTTL: 300000, // 5 minutes
  services: [
    { id: 'uni-classifier', name: 'Uni Classifier', description: 'Single product classification' },
    { id: 'multi-classifier', name: 'Multi Classifier', description: 'Batch processing classification' },
    { id: 'sat-search', name: 'SAT Search', description: 'Mexican tax code lookup' },
    { id: 'merceology', name: 'Merceology', description: 'Advanced classification analysis' },
    { id: 'product-validator', name: 'Product Validator', description: 'Description validation service' }
  ]
} as const

export const WEBSOCKET_CONFIG = {
  url: process.env.NEXT_PUBLIC_WS_URL,
  enabled: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true',
  heartbeatInterval: 30000, // 30 seconds
  reconnectInterval: 3000, // 3 seconds
  maxReconnectAttempts: 5
} as const

export const DASHBOARD_CONFIG = {
  updateInterval: parseInt(process.env.NEXT_PUBLIC_UPDATE_INTERVAL || '2500'),
  enableRealTime: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME !== 'false',
  enable3DGlobe: process.env.NEXT_PUBLIC_ENABLE_3D_GLOBE !== 'false',
  debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  maxHistoryItems: 100,
  animationDuration: 300
} as const

export const KPI_THRESHOLDS = {
  activeFlights: { warning: 800, critical: 500 },
  aircraftUtilization: { warning: 6, critical: 4 }, // hours/day
  loadFactor: { warning: 60, critical: 40 }, // percentage
  fuelEfficiency: { warning: 3.5, critical: 4.0 }, // L/ton-km (lower is better)
  ratk: { warning: 0.25, critical: 0.20 }, // $/ton-km
  hubTurnTime: { warning: 90, critical: 120 }, // minutes (lower is better)
  aduanappClassifications: { warning: 10000, critical: 5000 },
  complianceScore: { warning: 85, critical: 75 }, // percentage
  onTimePerformance: { warning: 80, critical: 70 }, // percentage
  cargoThroughput: { warning: 6000, critical: 4000 }, // tons/day
  revenuePerFlight: { warning: 100000, critical: 75000 }, // USD
  costPerTonKm: { warning: 0.40, critical: 0.50 } // USD (lower is better)
} as const

export const ALERT_CONFIG = {
  maxAlerts: 50,
  autoAcknowledgeAfter: 300000, // 5 minutes
  severityColors: {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    critical: '#dc2626'
  },
  soundEnabled: false,
  emailNotifications: true
} as const

export const AIRPORT_TYPES = {
  hub: {
    label: 'Major Hub',
    color: '#ef4444',
    minTraffic: 70,
    shape: 'cone'
  },
  international: {
    label: 'International',
    color: '#4ecdc4',
    minTraffic: 40,
    shape: 'sphere'
  },
  regional: {
    label: 'Regional',
    color: '#ffe66d',
    minTraffic: 0,
    shape: 'sphere'
  }
} as const

export const CARGO_TYPES = {
  electronics: { label: 'Electronics', color: '#3b82f6', priority: 'high' },
  automotive: { label: 'Automotive', color: '#8b5cf6', priority: 'medium' },
  pharmaceuticals: { label: 'Pharmaceuticals', color: '#10b981', priority: 'high' },
  textiles: { label: 'Textiles', color: '#f59e0b', priority: 'low' },
  food: { label: 'Food & Beverages', color: '#ef4444', priority: 'medium' },
  machinery: { label: 'Machinery', color: '#6b7280', priority: 'medium' },
  chemicals: { label: 'Chemicals', color: '#dc2626', priority: 'high' },
  other: { label: 'Other', color: '#9ca3af', priority: 'low' }
} as const

export const TRADE_ROUTES = {
  transpacific: {
    label: 'Transpacific',
    routes: ['LAX-NRT', 'LAX-SIN', 'SEA-ICN'],
    importance: 'high'
  },
  transatlantic: {
    label: 'Transatlantic',
    routes: ['JFK-LHR', 'JFK-FRA', 'BOS-DUB'],
    importance: 'high'
  },
  intraAsia: {
    label: 'Intra-Asia',
    routes: ['NRT-SIN', 'ICN-BKK', 'SIN-HKG'],
    importance: 'medium'
  },
  americas: {
    label: 'Americas',
    routes: ['LAX-GRU', 'MIA-BOG', 'YYZ-MEX'],
    importance: 'medium'
  },
  europe: {
    label: 'Europe',
    routes: ['LHR-FRA', 'CDG-AMS', 'FRA-VIE'],
    importance: 'medium'
  },
  middleEast: {
    label: 'Middle East',
    routes: ['DXB-DOH', 'DXB-KWI', 'BAH-RUH'],
    importance: 'low'
  }
} as const

export const TIME_RANGES = {
  '1h': { label: '1 Hour', milliseconds: 60 * 60 * 1000 },
  '6h': { label: '6 Hours', milliseconds: 6 * 60 * 60 * 1000 },
  '24h': { label: '24 Hours', milliseconds: 24 * 60 * 60 * 1000 },
  '7d': { label: '7 Days', milliseconds: 7 * 24 * 60 * 60 * 1000 },
  '30d': { label: '30 Days', milliseconds: 30 * 24 * 60 * 60 * 1000 },
  'custom': { label: 'Custom', milliseconds: 0 }
} as const

export const CURRENCY_CONFIG = {
  default: 'USD',
  supported: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
  formatter: {
    style: 'currency',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
} as const

export const DATE_FORMAT = {
  short: 'MMM dd',
  medium: 'MMM dd, yyyy',
  long: 'MMMM dd, yyyy',
  time: 'HH:mm:ss',
  datetime: 'MMM dd, yyyy HH:mm:ss',
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
} as const

export const CHART_COLORS = {
  primary: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
  gradient: [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  ],
  status: {
    online: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    offline: '#6b7280'
  }
} as const

export const ANIMATION_CONFIG = {
  fast: 150,
  normal: 300,
  slow: 500,
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 25
  },
  easing: {
    easeOut: [0.0, 0.0, 0.2, 1],
    easeIn: [0.4, 0.0, 1, 1],
    easeInOut: [0.4, 0.0, 0.2, 1]
  }
} as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

// Error messages
export const ERROR_MESSAGES = {
  networkError: 'Network connection error. Please check your internet connection.',
  apiError: 'Service temporarily unavailable. Please try again later.',
  authError: 'Authentication failed. Please check your credentials.',
  validationError: 'Invalid input. Please check your data and try again.',
  rateLimitError: 'Too many requests. Please wait before trying again.',
  timeoutError: 'Request timed out. Please try again.',
  unknownError: 'An unexpected error occurred. Please try again.'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  dataUpdated: 'Data updated successfully',
  settingsSaved: 'Settings saved successfully',
  connectionEstablished: 'Connection established',
  operationCompleted: 'Operation completed successfully'
} as const