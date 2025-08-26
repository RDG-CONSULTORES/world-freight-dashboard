'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

// Declare Plotly type for TypeScript
declare global {
  interface Window {
    Plotly: any
  }
}

export default function PlotlyGlobe() {
  const plotRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlotly = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Check if Plotly is already loaded
          if (window.Plotly) {
            setIsLoaded(true)
            renderGlobe()
            return
          }

          // Load Plotly dynamically
          const script = document.createElement('script')
          script.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js'
          script.async = true
          
          script.onload = () => {
            console.log('✅ Plotly loaded successfully')
            setIsLoaded(true)
            setTimeout(renderGlobe, 100) // Small delay to ensure DOM is ready
          }
          
          script.onerror = () => {
            setError('Failed to load Plotly.js')
          }
          
          document.head.appendChild(script)
        }
      } catch (err) {
        console.error('Error loading Plotly:', err)
        setError('Error loading Plotly.js')
      }
    }

    loadPlotly()
  }, [])

  const renderGlobe = () => {
    if (!window.Plotly || !plotRef.current) {
      console.warn('Plotly or plot container not available')
      return
    }

    try {
      // World Freight Hubs Data
      const hubs = [
        { name: "Memphis", lat: 35.0424, lng: -89.9767, cargo: 4613000, type: "major" },
        { name: "Hong Kong", lat: 22.3080, lng: 113.9185, cargo: 4520000, type: "major" },
        { name: "Shanghai", lat: 31.1443, lng: 121.8083, cargo: 3630000, type: "major" },
        { name: "Anchorage", lat: 61.1744, lng: -149.9961, cargo: 3162000, type: "major" },
        { name: "Dubai", lat: 25.2532, lng: 55.3657, cargo: 2650000, type: "major" },
        { name: "Frankfurt", lat: 50.0379, lng: 8.5622, cargo: 2280000, type: "major" },
        { name: "Los Angeles", lat: 34.0522, lng: -118.2437, cargo: 2268000, type: "major" },
        { name: "Paris", lat: 49.0097, lng: 2.5479, cargo: 2180000, type: "regional" },
        { name: "London", lat: 51.4700, lng: -0.4543, cargo: 1770000, type: "regional" },
        { name: "Amsterdam", lat: 52.3105, lng: 4.7683, cargo: 1740000, type: "regional" }
      ]

      const routes = [
        { from: [22.3080, 113.9185], to: [35.0424, -89.9767], color: '#06b6d4' },
        { from: [31.1443, 121.8083], to: [34.0522, -118.2437], color: '#10b981' },
        { from: [50.0379, 8.5622], to: [41.9742, -87.9073], color: '#8b5cf6' },
        { from: [51.4700, -0.4543], to: [35.0424, -89.9767], color: '#ef4444' },
        { from: [25.2532, 55.3657], to: [50.0379, 8.5622], color: '#f97316' }
      ]

      const traces: any[] = []

      // Add hub markers
      hubs.forEach(hub => {
        const size = hub.type === 'major' ? 40 : 25
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
            opacity: 0.9
          },
          textposition: 'bottom center',
          textfont: { size: 12, color: '#ffffff', family: 'Inter' },
          showlegend: false,
          hovertemplate: `<b>${hub.name}</b><br>Type: ${hub.type}<br>Cargo: ${(hub.cargo/1000000).toFixed(1)}M tons/year<extra></extra>`
        })
      })

      // Add route lines
      routes.forEach((route, i) => {
        traces.push({
          type: 'scattergeo',
          lat: [route.from[0], route.to[0]],
          lon: [route.from[1], route.to[1]],
          mode: 'lines',
          line: {
            width: 3,
            color: route.color,
            opacity: 0.7
          },
          showlegend: false,
          hoverinfo: 'skip'
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
        height: 500
      }

      const config = {
        responsive: true,
        displayModeBar: false,
        scrollZoom: true,
        doubleClick: 'reset'
      }

      window.Plotly.newPlot(plotRef.current, traces, layout, config)
        .then(() => {
          console.log('🌍 Plotly globe rendered successfully!')
        })
        .catch((err: any) => {
          console.error('Error rendering globe:', err)
          setError('Failed to render globe')
        })

    } catch (err) {
      console.error('Error in renderGlobe:', err)
      setError('Error rendering globe visualization')
    }
  }

  if (error) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h3 className="text-red-400 font-bold mb-2">Globe Loading Error</h3>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading Interactive Globe...</p>
          <p className="text-xs text-cyan-400">⚡ Plotly.js • Real World Maps</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Success Indicator */}
      <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
        <p className="text-sm text-green-400 text-center">✅ NEW PLOTLY GLOBE LOADED SUCCESSFULLY</p>
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border border-border/50">
        <button
          onClick={() => window.Plotly && window.Plotly.relayout(plotRef.current, {
            'geo.projection.rotation': { lat: 20, lon: -30, roll: 0 },
            'geo.projection.scale': 1
          })}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted text-muted-foreground hover:bg-muted/80 rounded-md transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset View
        </button>
        <div className="ml-auto text-xs text-muted-foreground">
          🖱️ Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* Globe Container */}
      <div className="bg-card/30 rounded-lg border border-border/50 overflow-hidden">
        <div ref={plotRef} style={{ width: '100%', height: '500px' }} />
      </div>
    </div>
  )
}