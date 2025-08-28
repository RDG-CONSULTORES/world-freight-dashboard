'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Settings, MapPin, Plane } from 'lucide-react'

// Interface definitions
interface Hub {
  name: string
  code: string
  lat: number
  lng: number
  cargo: number
  type: 'major' | 'regional'
  country: string
  company: string
}

interface Route {
  from: string
  to: string
  volume: number
  color: string
  id: string
}

interface Aircraft {
  id: string
  routeId: string
  fromHub: Hub
  toHub: Hub
  progress: number
  speed: number
  icon: string
}

// World Freight Data
const WORLD_FREIGHT_HUBS: Hub[] = [
  // Major Hubs
  { name: "Memphis", code: "MEM", lat: 35.0424, lng: -89.9767, cargo: 4613000, type: "major", country: "USA", company: "FedEx" },
  { name: "Hong Kong", code: "HKG", lat: 22.3080, lng: 113.9185, cargo: 4520000, type: "major", country: "Hong Kong", company: "Cathay Pacific" },
  { name: "Shanghai", code: "PVG", lat: 31.1443, lng: 121.8083, cargo: 3630000, type: "major", country: "China", company: "China Cargo" },
  { name: "Anchorage", code: "ANC", lat: 61.1744, lng: -149.9961, cargo: 3162000, type: "major", country: "USA", company: "UPS/FedEx" },
  { name: "Seoul", code: "ICN", lat: 37.4602, lng: 126.4407, cargo: 2840000, type: "major", country: "South Korea", company: "Korean Air" },
  { name: "Dubai", code: "DXB", lat: 25.2532, lng: 55.3657, cargo: 2650000, type: "major", country: "UAE", company: "Emirates" },
  { name: "Los Angeles", code: "LAX", lat: 34.0522, lng: -118.2437, cargo: 2268000, type: "major", country: "USA", company: "Multiple" },
  { name: "Frankfurt", code: "FRA", lat: 50.0379, lng: 8.5622, cargo: 2280000, type: "major", country: "Germany", company: "Lufthansa Cargo" },
  
  // Regional Hubs
  { name: "Paris", code: "CDG", lat: 49.0097, lng: 2.5479, cargo: 2180000, type: "regional", country: "France", company: "Air France" },
  { name: "London", code: "LHR", lat: 51.4700, lng: -0.4543, cargo: 1770000, type: "regional", country: "UK", company: "British Airways" },
  { name: "Amsterdam", code: "AMS", lat: 52.3105, lng: 4.7683, cargo: 1740000, type: "regional", country: "Netherlands", company: "KLM Cargo" },
  { name: "Miami", code: "MIA", lat: 25.7959, lng: -80.2870, cargo: 2340000, type: "regional", country: "USA", company: "American" },
  { name: "Tokyo", code: "NRT", lat: 35.7720, lng: 140.3929, cargo: 2180000, type: "regional", country: "Japan", company: "JAL/ANA" },
  { name: "Singapore", code: "SIN", lat: 1.3644, lng: 103.9915, cargo: 2030000, type: "regional", country: "Singapore", company: "Singapore Airlines" },
  { name: "Taipei", code: "TPE", lat: 25.0797, lng: 121.2342, cargo: 2230000, type: "regional", country: "Taiwan", company: "China Airlines" },
  { name: "Chicago", code: "ORD", lat: 41.9742, lng: -87.9073, cargo: 1435000, type: "regional", country: "USA", company: "United/AA" },
  { name: "Liège", code: "LGG", lat: 50.6374, lng: 5.4432, cargo: 1040000, type: "regional", country: "Belgium", company: "TNT/FedEx" },
  { name: "Doha", code: "DOH", lat: 25.2731, lng: 51.6080, cargo: 1450000, type: "regional", country: "Qatar", company: "Qatar Airways" },
  { name: "São Paulo", code: "GRU", lat: -23.4356, lng: -46.4731, cargo: 580000, type: "regional", country: "Brazil", company: "LATAM" },
  { name: "Sydney", code: "SYD", lat: -33.9399, lng: 151.1753, cargo: 580000, type: "regional", country: "Australia", company: "Qantas" }
]

const WORLD_FREIGHT_ROUTES: Route[] = [
  { from: "HKG", to: "MEM", volume: 285000, color: '#06b6d4', id: "HKG-MEM" },
  { from: "PVG", to: "LAX", volume: 240000, color: '#10b981', id: "PVG-LAX" },
  { from: "FRA", to: "ORD", volume: 180000, color: '#8b5cf6', id: "FRA-ORD" },
  { from: "LHR", to: "MEM", volume: 165000, color: '#ef4444', id: "LHR-MEM" },
  { from: "DXB", to: "FRA", volume: 125000, color: '#f97316', id: "DXB-FRA" },
  { from: "AMS", to: "HKG", volume: 145000, color: '#3b82f6', id: "AMS-HKG" },
  { from: "NRT", to: "ANC", volume: 195000, color: '#fbbf24', id: "NRT-ANC" },
  { from: "SIN", to: "DXB", volume: 98000, color: '#6366f1', id: "SIN-DXB" }
]

const AIRCRAFT_ICONS = ['✈', '🛫', '🛬', '✈️']

export default function GlobePlotlyFunctional() {
  const plotRef = useRef<HTMLDivElement>(null)
  const [currentFilter, setCurrentFilter] = useState<'all' | 'major' | 'regional'>('all')
  const [isAircraftActive, setIsAircraftActive] = useState(false)
  const [aircraftPositions, setAircraftPositions] = useState<Aircraft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const aircraftInterval = useRef<NodeJS.Timeout | null>(null)

  // Utility functions
  const getHub = (code: string): Hub | undefined => {
    return WORLD_FREIGHT_HUBS.find(h => h.code === code)
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const interpolateGreatCircle = (lat1: number, lng1: number, lat2: number, lng2: number, fraction: number) => {
    const phi1 = lat1 * Math.PI / 180
    const phi2 = lat2 * Math.PI / 180
    const deltaLng = (lng2 - lng1) * Math.PI / 180
    
    const A = Math.sin((1 - fraction) * Math.acos(Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(deltaLng))) / Math.sin(Math.acos(Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(deltaLng)))
    const B = Math.sin(fraction * Math.acos(Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(deltaLng))) / Math.sin(Math.acos(Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(deltaLng)))
    
    const x = A * Math.cos(phi1) * Math.cos(lng1 * Math.PI / 180) + B * Math.cos(phi2) * Math.cos(lng2 * Math.PI / 180)
    const y = A * Math.cos(phi1) * Math.sin(lng1 * Math.PI / 180) + B * Math.cos(phi2) * Math.sin(lng2 * Math.PI / 180)
    const z = A * Math.sin(phi1) + B * Math.sin(phi2)
    
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI
    const lng = Math.atan2(y, x) * 180 / Math.PI
    
    return { lat, lng }
  }

  // Load Plotly dynamically
  useEffect(() => {
    const loadPlotly = async () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        if (!(window as any).Plotly) {
          const script = document.createElement('script')
          script.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js'
          script.async = true
          script.onload = () => {
            setIsLoading(false)
            updateGlobe()
          }
          document.head.appendChild(script)
        } else {
          setIsLoading(false)
          updateGlobe()
        }
      }
    }
    
    loadPlotly()
  }, [])

  // Update globe when filter changes
  useEffect(() => {
    if (!isLoading) {
      updateGlobe()
    }
  }, [currentFilter, isLoading])

  const updateGlobe = () => {
    // @ts-ignore
    if (!(window as any).Plotly || !plotRef.current) return

    let hubs = WORLD_FREIGHT_HUBS.slice()
    
    // Apply filters
    if (currentFilter !== 'all') {
      hubs = hubs.filter(h => h.type === currentFilter)
    }

    const traces: any[] = []

    // Add hubs
    hubs.forEach(hub => {
      const size = hub.type === 'major' ? 
        Math.max(30, Math.min(hub.cargo / 50000, 60)) : 
        Math.max(20, Math.min(hub.cargo / 70000, 40))
      
      const color = hub.type === 'major' ? '#ef4444' : '#06b6d4'

      traces.push({
        type: 'scattergeo',
        lat: [hub.lat],
        lon: [hub.lng],
        text: [hub.name],
        mode: 'markers+text',
        marker: {
          size: size,
          color: color,
          line: { width: 2, color: '#ffffff' },
          symbol: 'circle',
          opacity: 0.9
        },
        textposition: 'bottom center',
        textfont: { size: 11, color: '#ffffff', family: 'Inter' },
        showlegend: false,
        hovertemplate: `<b>${hub.name} (${hub.code})</b><br>` +
                     `Type: ${hub.type}<br>` +
                     `Cargo: ${(hub.cargo/1000000).toFixed(1)}M tons/year<br>` +
                     `Company: ${hub.company}<br>` +
                     `Country: ${hub.country}<extra></extra>`
      })

      // Add glow effect for major hubs
      if (hub.type === 'major') {
        traces.push({
          type: 'scattergeo',
          lat: [hub.lat],
          lon: [hub.lng],
          mode: 'markers',
          marker: {
            size: size + 15,
            color: color,
            line: { width: 0 },
            symbol: 'circle',
            opacity: 0.2
          },
          showlegend: false,
          hoverinfo: 'skip'
        })
      }
    })

    // Add routes
    WORLD_FREIGHT_ROUTES.forEach(route => {
      const fromHub = getHub(route.from)
      const toHub = getHub(route.to)
      
      if (!fromHub || !toHub) return

      const lineWidth = Math.max(2, Math.min(route.volume / 50000, 4))

      traces.push({
        type: 'scattergeo',
        lat: [fromHub.lat, toHub.lat],
        lon: [fromHub.lng, toHub.lng],
        mode: 'lines',
        line: {
          width: lineWidth,
          color: route.color,
          opacity: 0.7
        },
        showlegend: false,
        hovertemplate: `${route.from} → ${route.to}<br>` +
                     `Volume: ${(route.volume/1000).toFixed(0)}K tons/year<br>` +
                     `Distance: ~${calculateDistance(fromHub.lat, fromHub.lng, toHub.lat, toHub.lng).toFixed(0)} km<extra></extra>`
      })
    })

    const layout = {
      geo: {
        scope: 'world',
        projection: {
          type: 'orthographic',
          rotation: { lat: 20, lon: -30, roll: 0 }
        },
        showland: true,
        landcolor: 'rgba(50, 60, 80, 0.9)',
        showocean: true,
        oceancolor: 'rgba(20, 30, 50, 0.95)',
        showcountries: true,
        countrycolor: 'rgba(6, 182, 212, 0.4)',
        countrywidth: 0.8,
        coastlinecolor: 'rgba(6, 182, 212, 0.6)',
        coastlinewidth: 1,
        showlakes: true,
        lakecolor: 'rgba(20, 30, 50, 0.9)',
        bgcolor: 'rgba(0,0,0,0)',
        showframe: false
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#ffffff', family: 'Inter' },
      margin: { l: 0, r: 0, t: 0, b: 0 },
      showlegend: false,
      height: 600
    }

    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d'],
      displaylogo: false,
      scrollZoom: true,
      doubleClick: 'reset'
    }

    // @ts-ignore
    ;(window as any).Plotly.newPlot(plotRef.current, traces, layout, config).then(() => {
      console.log('🌍 Globe rendered successfully with mouse controls')
    })
  }

  const toggleAircraft = () => {
    if (!isAircraftActive) {
      setIsAircraftActive(true)
      
      // Initialize aircraft positions
      const aircraft: Aircraft[] = []
      WORLD_FREIGHT_ROUTES.forEach((route, index) => {
        const fromHub = getHub(route.from)
        const toHub = getHub(route.to)
        
        if (fromHub && toHub) {
          const numAircraft = 2
          for (let i = 0; i < numAircraft; i++) {
            aircraft.push({
              id: `${route.from}-${route.to}-${i}`,
              routeId: route.id,
              fromHub,
              toHub,
              progress: (i / numAircraft) * 0.8,
              speed: 0.01 + Math.random() * 0.005,
              icon: AIRCRAFT_ICONS[Math.floor(Math.random() * AIRCRAFT_ICONS.length)]
            })
          }
        }
      })
      
      setAircraftPositions(aircraft)
      
      // Start animation
      aircraftInterval.current = setInterval(() => {
        setAircraftPositions(prev => 
          prev.map(aircraft => ({
            ...aircraft,
            progress: aircraft.progress >= 1 ? 0 : aircraft.progress + aircraft.speed
          }))
        )
      }, 200)
      
    } else {
      setIsAircraftActive(false)
      if (aircraftInterval.current) {
        clearInterval(aircraftInterval.current)
        aircraftInterval.current = null
      }
      setAircraftPositions([])
      updateGlobe() // Reset to remove aircraft
    }
  }

  // Update aircraft on globe
  useEffect(() => {
    if (isAircraftActive && aircraftPositions.length > 0) {
      // @ts-ignore
      if (!(window as any).Plotly || !plotRef.current) return

      const aircraftTraces = aircraftPositions.map(aircraft => {
        const position = interpolateGreatCircle(
          aircraft.fromHub.lat, aircraft.fromHub.lng,
          aircraft.toHub.lat, aircraft.toHub.lng,
          aircraft.progress
        )

        return {
          type: 'scattergeo',
          lat: [position.lat],
          lon: [position.lng],
          mode: 'text',
          text: [aircraft.icon],
          textfont: { size: 16, color: '#fbbf24' },
          showlegend: false,
          name: `aircraft_${aircraft.id}`,
          hovertemplate: `<b>✈️ Flight ${aircraft.id}</b><br>` +
                       `From: ${aircraft.fromHub.name}<br>` +
                       `To: ${aircraft.toHub.name}<br>` +
                       `Progress: ${Math.round(aircraft.progress * 100)}%<extra></extra>`
        }
      })

      // Get current data and add aircraft
      // @ts-ignore
      const currentData = plotRef.current.data || []
      const baseTraces = currentData.filter((trace: any) => !trace.name?.startsWith('aircraft_'))
      const newData = [...baseTraces, ...aircraftTraces]
      
      // @ts-ignore
      ;(window as any).Plotly.react(plotRef.current, newData)
    }
  }, [aircraftPositions])

  const resetView = () => {
    // @ts-ignore
    if ((window as any).Plotly && plotRef.current) {
      // @ts-ignore
      ;(window as any).Plotly.relayout(plotRef.current, {
        'geo.projection.rotation': { lat: 20, lon: -30, roll: 0 },
        'geo.projection.scale': 1
      })
    }
  }

  const focusRegion = (region: 'americas' | 'europe' | 'asia') => {
    // @ts-ignore
    if (!(window as any).Plotly || !plotRef.current) return

    const rotations = {
      americas: { lat: 10, lon: -90, roll: 0, scale: 2 },
      europe: { lat: 30, lon: 10, roll: 0, scale: 2.5 },
      asia: { lat: 15, lon: 120, roll: 0, scale: 2 }
    }

    const { scale, ...rotation } = rotations[region]
    
    // @ts-ignore
    ;(window as any).Plotly.relayout(plotRef.current, {
      'geo.projection.rotation': rotation,
      'geo.projection.scale': scale
    })
  }

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading NEW Plotly Globe...</p>
          <p className="text-xs text-orange-400">✨ Functional version with real maps</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card/50 rounded-lg border border-border/50">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filter:</span>
          {(['all', 'major', 'regional'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setCurrentFilter(filter)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                currentFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {filter === 'all' ? 'All Hubs' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Hubs`}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border"></div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetView}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => focusRegion('americas')}
            className="px-3 py-1.5 text-sm bg-muted text-muted-foreground hover:bg-muted/80 rounded-md transition-all"
          >
            Americas
          </button>
          <button
            onClick={() => focusRegion('europe')}
            className="px-3 py-1.5 text-sm bg-muted text-muted-foreground hover:bg-muted/80 rounded-md transition-all"
          >
            Europe
          </button>
          <button
            onClick={() => focusRegion('asia')}
            className="px-3 py-1.5 text-sm bg-muted text-muted-foreground hover:bg-muted/80 rounded-md transition-all"
          >
            Asia
          </button>
        </div>

        <div className="h-4 w-px bg-border"></div>

        {/* Aircraft Toggle */}
        <button
          onClick={toggleAircraft}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all ${
            isAircraftActive
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {isAircraftActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isAircraftActive ? 'Stop Aircraft' : 'Start Aircraft'}
        </button>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{WORLD_FREIGHT_HUBS.filter(h => currentFilter === 'all' || h.type === currentFilter).length} Hubs</span>
          </div>
          <div className="flex items-center gap-1">
            <Plane className="w-4 h-4" />
            <span>{aircraftPositions.length} Aircraft</span>
          </div>
        </div>
      </div>

      {/* Mouse Controls Info */}
      <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm text-primary font-medium">🖱️ Mouse Controls: Drag to rotate • Scroll to zoom • Double-click to reset</p>
      </div>

      {/* Globe Container */}
      <div className="bg-card/30 rounded-lg border border-border/50 overflow-hidden">
        <div ref={plotRef} style={{ width: '100%', height: '600px' }} />
      </div>
    </div>
  )
}