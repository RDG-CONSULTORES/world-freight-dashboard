// Core data interfaces for World Freight Dashboard

export interface FlightData {
  id: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  aircraft: Aircraft;
  departureTime: string;
  arrivalTime: string;
  status: 'scheduled' | 'delayed' | 'in-flight' | 'landed' | 'cancelled';
  cargo: CargoData;
  route: RoutePoint[];
  currentLocation?: Coordinates;
  estimatedArrival?: string;
  delay?: number; // minutes
}

export interface Aircraft {
  id: string;
  type: string;
  model: string;
  registration: string;
  capacity: {
    maxWeight: number; // kg
    maxVolume: number; // m³
    passengers?: number;
  };
  utilization: {
    hoursPerDay: number;
    efficiency: number; // percentage
  };
  fuelConsumption: {
    litersPerHour: number;
    efficiency: number; // L/ton-km
  };
}

export interface Airport {
  id: string;
  code: string; // IATA code
  icao: string; // ICAO code
  name: string;
  city: string;
  country: string;
  coordinates: Coordinates;
  timezone: string;
  performance: AirportPerformance;
}

export interface AirportPerformance {
  hubTurnTime: number; // minutes
  onTimePerformance: number; // percentage
  cargoThroughput: number; // tons per day
  utilizationRate: number; // percentage
  efficiency: number; // percentage
  capacity: {
    current: number;
    maximum: number;
    available: number;
  };
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface RoutePoint {
  coordinates: Coordinates;
  timestamp: string;
  altitude: number;
  speed: number;
}

export interface CargoData {
  totalWeight: number; // kg
  totalVolume: number; // m³
  loadFactor: number; // percentage
  commodities: CommodityFlow[];
  hazardous: boolean;
  temperature?: 'ambient' | 'chilled' | 'frozen';
}

export interface CommodityFlow {
  type: 'electronics' | 'automotive' | 'pharmaceuticals' | 'textiles' | 'food' | 'machinery' | 'chemicals' | 'other';
  weight: number; // kg
  volume: number; // m³
  value: number; // USD
  origin: string;
  destination: string;
  classification?: AduanappClassification;
}

export interface TradeRoute {
  id: string;
  origin: Airport;
  destination: Airport;
  distance: number; // km
  averageFlightTime: number; // minutes
  frequency: number; // flights per week
  capacity: number; // tons per week
  utilization: number; // percentage
  revenue: number; // USD per week
  profitability: number; // percentage
  trends: {
    volume: TrendIndicator;
    revenue: TrendIndicator;
    efficiency: TrendIndicator;
  };
  seasonality: SeasonalityData[];
}

export interface TrendIndicator {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export interface SeasonalityData {
  month: number;
  volumeMultiplier: number;
  revenueMultiplier: number;
}

export interface AduanappMetrics {
  services: AduanappService[];
  totalClassifications: number;
  processingTime: {
    average: number; // seconds
    p95: number;
    p99: number;
  };
  accuracy: {
    overall: number; // percentage
    byService: Record<string, number>;
  };
  costPerOperation: number; // USD
  trends: {
    volume: TrendIndicator;
    accuracy: TrendIndicator;
    performance: TrendIndicator;
  };
  uptime: number; // percentage
}

export interface AduanappService {
  id: 'uni-classifier' | 'multi-classifier' | 'sat-search' | 'merceology' | 'product-validator';
  name: string;
  description: string;
  status: 'active' | 'maintenance' | 'degraded' | 'offline';
  requests: {
    total: number;
    successful: number;
    failed: number;
    avgResponseTime: number; // ms
  };
  accuracy: number; // percentage
  lastUpdated: string;
}

export interface AduanappClassification {
  hsCode: string;
  description: string;
  confidence: number; // percentage
  alternatives?: Array<{
    hsCode: string;
    confidence: number;
  }>;
  processingTime: number; // ms
}

export interface KPIData {
  activeFlights: number;
  aircraftUtilization: number; // hours per day
  loadFactor: number; // percentage
  fuelEfficiency: number; // L/ton-km
  ratk: number; // Revenue per Available Ton-Kilometer (USD)
  hubTurnTime: number; // minutes
  aduanappClassifications: number;
  complianceScore: number; // percentage
  onTimePerformance: number; // percentage
  cargoThroughput: number; // tons per day
  revenuePerFlight: number; // USD
  costPerTonKm: number; // USD
}

export interface PredictiveAnalytics {
  demandForecast: ForecastData[];
  capacityOptimization: OptimizationSuggestion[];
  routeRecommendations: RouteRecommendation[];
  maintenanceSchedule: MaintenanceEvent[];
  riskAssessment: RiskFactor[];
  marketInsights: MarketInsight[];
}

export interface ForecastData {
  date: string;
  predicted: number;
  confidence: number; // percentage
  factors: string[];
  type: 'demand' | 'capacity' | 'revenue' | 'cost';
}

export interface OptimizationSuggestion {
  id: string;
  type: 'route' | 'schedule' | 'capacity' | 'pricing';
  description: string;
  impact: {
    metric: string;
    improvement: number;
    confidence: number;
  };
  implementation: {
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    cost: number;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface RouteRecommendation {
  origin: string;
  destination: string;
  projectedDemand: number;
  profitability: number;
  riskScore: number;
  requiredCapacity: number;
  marketPotential: number;
}

export interface MaintenanceEvent {
  aircraftId: string;
  type: 'scheduled' | 'predictive' | 'emergency';
  scheduledDate: string;
  duration: number; // hours
  cost: number;
  impact: {
    flightsAffected: number;
    revenueImpact: number;
  };
}

export interface RiskFactor {
  id: string;
  category: 'operational' | 'financial' | 'regulatory' | 'environmental';
  description: string;
  probability: number; // percentage
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  status: 'monitoring' | 'action-required' | 'resolved';
}

export interface MarketInsight {
  region: string;
  trend: TrendIndicator;
  opportunities: string[];
  threats: string[];
  recommendations: string[];
  confidence: number;
}

export interface AlertSystem {
  alerts: Alert[];
  notifications: Notification[];
  systemHealth: SystemHealth;
}

export interface Alert {
  id: string;
  type: 'operational' | 'financial' | 'technical' | 'regulatory';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  source: string;
  acknowledged: boolean;
  resolved: boolean;
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary';
  action: () => void;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  persistent?: boolean;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: ComponentHealth[];
  uptime: number;
  lastCheck: string;
}

export interface ComponentHealth {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  responseTime?: number;
  errorRate?: number;
  lastUpdated: string;
}

export interface DashboardState {
  isLoading: boolean;
  lastUpdated: string;
  error?: string;
  filters: DashboardFilters;
  realTimeData: {
    kpis: KPIData;
    flights: FlightData[];
    routes: TradeRoute[];
    aduanapp: AduanappMetrics;
    alerts: AlertSystem;
  };
}

export interface DashboardFilters {
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' | 'custom';
  regions: string[];
  commodities: string[];
  routes: string[];
  showPredictive: boolean;
}

export interface WebSocketMessage {
  type: 'kpi_update' | 'flight_update' | 'alert' | 'route_update' | 'aduanapp_update';
  data: any;
  timestamp: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

// Export all interfaces as a union type for type guards
export type DashboardData = 
  | FlightData 
  | TradeRoute 
  | AirportPerformance 
  | AduanappMetrics 
  | KPIData 
  | PredictiveAnalytics 
  | AlertSystem;