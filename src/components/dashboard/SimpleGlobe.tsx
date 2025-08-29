'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, MapPin, Plane } from 'lucide-react'

export default function SimpleGlobe() {
  const plotRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<'all' | 'major' | 'regional'>('all')
  const [showAircraft, setShowAircraft] = useState(false)
  const aircraftInterval = useRef<NodeJS.Timeout | null>(null)
  const [aircraftProgress, setAircraftProgress] = useState(0)

  useEffect(() => {
    if (!plotRef.current) return

    // Load Plotly and render
    const script = document.createElement('script')
    script.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js'
    script.onload = () => {
      renderGlobe()
    }
    document.head.appendChild(script)

    function renderGlobe() {
      const Plotly = (window as any).Plotly
      if (!Plotly || !plotRef.current) return

      try {
        // World Freight Data
        const allHubs = [
          { name: "Memphis", code: "MEM", lat: 35.0424, lng: -89.9767, cargo: 4613, type: "major", country: "USA" },
          { name: "Hong Kong", code: "HKG", lat: 22.3080, lng: 113.9185, cargo: 4520, type: "major", country: "Hong Kong" },
          { name: "Shanghai", code: "PVG", lat: 31.1443, lng: 121.8083, cargo: 3630, type: "major", country: "China" },
          { name: "Anchorage", code: "ANC", lat: 61.1744, lng: -149.9961, cargo: 3162, type: "major", country: "USA" },
          { name: "Seoul", code: "ICN", lat: 37.4602, lng: 126.4407, cargo: 2840, type: "major", country: "South Korea" },
          { name: "Dubai", code: "DXB", lat: 25.2532, lng: 55.3657, cargo: 2650, type: "major", country: "UAE" },
          { name: "Los Angeles", code: "LAX", lat: 34.0522, lng: -118.2437, cargo: 2268, type: "major", country: "USA" },
          { name: "Frankfurt", code: "FRA", lat: 50.0379, lng: 8.5622, cargo: 2280, type: "major", country: "Germany" },
          
          { name: "Paris", code: "CDG", lat: 49.0097, lng: 2.5479, cargo: 2180, type: "regional", country: "France" },
          { name: "London", code: "LHR", lat: 51.4700, lng: -0.4543, cargo: 1770, type: "regional", country: "UK" },
          { name: "Amsterdam", code: "AMS", lat: 52.3105, lng: 4.7683, cargo: 1740, type: "regional", country: "Netherlands" },
          { name: "Miami", code: "MIA", lat: 25.7959, lng: -80.2870, cargo: 2340, type: "regional", country: "USA" },
          { name: "Tokyo", code: "NRT", lat: 35.7720, lng: 140.3929, cargo: 2180, type: "regional", country: "Japan" },
          { name: "Singapore", code: "SIN", lat: 1.3644, lng: 103.9915, cargo: 2030, type: "regional", country: "Singapore" },
          { name: "Taipei", code: "TPE", lat: 25.0797, lng: 121.2342, cargo: 2230, type: "regional", country: "Taiwan" },
          { name: "Chicago", code: "ORD", lat: 41.9742, lng: -87.9073, cargo: 1435, type: "regional", country: "USA" },
          { name: "Liège", code: "LGG", lat: 50.6374, lng: 5.4432, cargo: 1040, type: "regional", country: "Belgium" },
          { name: "Doha", code: "DOH", lat: 25.2731, lng: 51.6080, cargo: 1450, type: "regional", country: "Qatar" },
          { name: "São Paulo", code: "GRU", lat: -23.4356, lng: -46.4731, cargo: 580, type: "regional", country: "Brazil" },
          { name: "Sydney", code: "SYD", lat: -33.9399, lng: 151.1753, cargo: 580, type: "regional", country: "Australia" }
        ]

        // Filter hubs based on current filter
        const hubs = filter === 'all' ? allHubs : allHubs.filter(h => h.type === filter)

        const routes = [
          { from: [22.3080, 113.9185], to: [35.0424, -89.9767], color: '#06b6d4', name: 'HKG-MEM', volume: 285 },
          { from: [31.1443, 121.8083], to: [34.0522, -118.2437], color: '#10b981', name: 'PVG-LAX', volume: 240 },
          { from: [50.0379, 8.5622], to: [25.7959, -80.2870], color: '#8b5cf6', name: 'FRA-MIA', volume: 180 },
          { from: [51.4700, -0.4543], to: [35.0424, -89.9767], color: '#ef4444', name: 'LHR-MEM', volume: 165 },
          { from: [25.2532, 55.3657], to: [50.0379, 8.5622], color: '#f97316', name: 'DXB-FRA', volume: 125 },
          { from: [52.3105, 4.7683], to: [22.3080, 113.9185], color: '#3b82f6', name: 'AMS-HKG', volume: 145 },
          { from: [35.7720, 140.3929], to: [61.1744, -149.9961], color: '#fbbf24', name: 'NRT-ANC', volume: 195 },
          { from: [1.3644, 103.9915], to: [25.2532, 55.3657], color: '#6366f1', name: 'SIN-DXB', volume: 98 }
        ]

        // Interpolate position for aircraft animation
        const interpolateRoute = (route: any, progress: number) => {
          const lat = route.from[0] + (route.to[0] - route.from[0]) * progress
          const lng = route.from[1] + (route.to[1] - route.from[1]) * progress
          return [lat, lng]
        }

        // Create traces
        const data: any[] = []

        // Add hub markers
        hubs.forEach(hub => {
          const size = hub.type === 'major' ? Math.max(25, hub.cargo / 150) : Math.max(15, hub.cargo / 200)
          const color = hub.type === 'major' ? '#ef4444' : '#06b6d4'

          data.push({
            type: 'scattergeo',
            lat: [hub.lat],
            lon: [hub.lng],
            text: [`${hub.name}<br>${hub.code}`],
            mode: 'markers+text',
            marker: {
              size: size,
              color: color,
              line: { width: 2, color: '#ffffff' },
              opacity: 0.9,
              symbol: 'circle'
            },
            textposition: 'top center',
            textfont: { size: 9, color: '#ffffff', family: 'Inter' },
            showlegend: false,
            hovertemplate: `<b>${hub.name} (${hub.code})</b><br>` +
                         `Type: ${hub.type}<br>` +
                         `Cargo: ${(hub.cargo / 1000).toFixed(1)}K tons/year<br>` +
                         `Country: ${hub.country}<extra></extra>`
          })

          // Glow effect for major hubs
          if (hub.type === 'major') {
            data.push({
              type: 'scattergeo',
              lat: [hub.lat],
              lon: [hub.lng],
              mode: 'markers',
              marker: {
                size: size + 10,
                color: color,
                opacity: 0.3,
                symbol: 'circle'
              },
              showlegend: false,
              hoverinfo: 'skip'
            })
          }
        })

        // Add routes
        routes.forEach(route => {
          data.push({
            type: 'scattergeo',
            lat: [route.from[0], route.to[0]],
            lon: [route.from[1], route.to[1]],
            mode: 'lines',
            line: {
              width: Math.max(2, route.volume / 80),
              color: route.color,
              opacity: 0.8
            },
            showlegend: false,
            hovertemplate: `<b>${route.name}</b><br>Volume: ${route.volume}K tons/year<extra></extra>`
          })
        })

        // Add aircraft if enabled
        if (showAircraft) {
          routes.forEach((route, i) => {
            const position = interpolateRoute(route, (aircraftProgress + i * 0.3) % 1)
            data.push({
              type: 'scattergeo',
              lat: [position[0]],
              lon: [position[1]],
              mode: 'text',
              text: ['✈️'],
              textfont: { size: 16, color: route.color },
              showlegend: false,
              hovertemplate: `<b>Flight ${route.name}</b><br>Progress: ${Math.round(((aircraftProgress + i * 0.3) % 1) * 100)}%<extra></extra>`
            })
          })
        }

        // Layout
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
            coastlinecolor: 'rgba(6, 182, 212, 0.6)',
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

        // Config
        const config = {
          responsive: true,
          displayModeBar: false,
          scrollZoom: true,
          doubleClick: 'reset'
        }

        // Render
        Plotly.newPlot(plotRef.current, data, layout, config)
          .then(() => {
            console.log('Globe rendered successfully!')
          })
          .catch((error: any) => {
            console.error('Globe render error:', error)
          })

      } catch (error) {
        console.error('Error in renderGlobe:', error)
      }
    }

    return () => {
      // Cleanup
      if (plotRef.current && (window as any).Plotly) {
        try {
          ;(window as any).Plotly.purge(plotRef.current)
        } catch (e) {
          console.log('Cleanup error:', e)
        }
      }
    }
  }, [filter, showAircraft, aircraftProgress])

  // Aircraft animation
  useEffect(() => {
    if (showAircraft) {
      aircraftInterval.current = setInterval(() => {
        setAircraftProgress(prev => (prev + 0.01) % 1)
      }, 100)
    } else {
      if (aircraftInterval.current) {
        clearInterval(aircraftInterval.current)
        aircraftInterval.current = null
      }
    }

    return () => {
      if (aircraftInterval.current) {
        clearInterval(aircraftInterval.current)
        aircraftInterval.current = null
      }
    }
  }, [showAircraft])

  const resetView = () => {
    const Plotly = (window as any).Plotly
    if (Plotly && plotRef.current) {
      Plotly.relayout(plotRef.current, {
        'geo.projection.rotation': { lat: 20, lon: -30, roll: 0 },
        'geo.projection.scale': 1
      })
    }
  }

  const focusRegion = (region: 'americas' | 'europe' | 'asia') => {
    const Plotly = (window as any).Plotly
    if (!Plotly || !plotRef.current) return

    const rotations = {
      americas: { lat: 10, lon: -90, roll: 0, scale: 2 },
      europe: { lat: 30, lon: 10, roll: 0, scale: 2.5 },
      asia: { lat: 15, lon: 120, roll: 0, scale: 2 }
    }

    const { scale, ...rotation } = rotations[region]
    
    Plotly.relayout(plotRef.current, {
      'geo.projection.rotation': rotation,
      'geo.projection.scale': scale
    })
  }

  const filteredHubs = filter === 'all' ? 20 : (filter === 'major' ? 8 : 12)

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card/50 rounded-lg border border-border/50">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filter:</span>
          {(['all', 'major', 'regional'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                filter === filterType
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {filterType === 'all' ? 'All Hubs' : `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Hubs`}
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
          onClick={() => setShowAircraft(!showAircraft)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all ${
            showAircraft
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {showAircraft ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {showAircraft ? 'Stop Aircraft' : 'Start Aircraft'}
        </button>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{filteredHubs} Hubs</span>
          </div>
          <div className="flex items-center gap-1">
            <Plane className="w-4 h-4" />
            <span>8 Routes</span>
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