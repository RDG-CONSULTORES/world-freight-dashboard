'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function WorldFreightGlobe() {
  const plotRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadPlotly = async () => {
      if (typeof window !== 'undefined' && plotRef.current) {
        // Load Plotly if not available
        if (!(window as any).Plotly) {
          const script = document.createElement('script')
          script.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js'
          script.onload = () => {
            setIsLoaded(true)
            renderGlobe()
          }
          document.head.appendChild(script)
        } else {
          setIsLoaded(true)
          renderGlobe()
        }
      }
    }

    const renderGlobe = () => {
      if (!(window as any).Plotly || !plotRef.current) return

      // World Freight Data - Adapted from AIFA
      const worldFreightHubs = [
        // Major Hubs
        { name: "Memphis", code: "MEM", lat: 35.0424, lng: -89.9767, cargo: 4613, type: "major", country: "USA" },
        { name: "Hong Kong", code: "HKG", lat: 22.3080, lng: 113.9185, cargo: 4520, type: "major", country: "Hong Kong" },
        { name: "Shanghai", code: "PVG", lat: 31.1443, lng: 121.8083, cargo: 3630, type: "major", country: "China" },
        { name: "Anchorage", code: "ANC", lat: 61.1744, lng: -149.9961, cargo: 3162, type: "major", country: "USA" },
        { name: "Seoul", code: "ICN", lat: 37.4602, lng: 126.4407, cargo: 2840, type: "major", country: "South Korea" },
        { name: "Dubai", code: "DXB", lat: 25.2532, lng: 55.3657, cargo: 2650, type: "major", country: "UAE" },
        { name: "Los Angeles", code: "LAX", lat: 34.0522, lng: -118.2437, cargo: 2268, type: "major", country: "USA" },
        { name: "Frankfurt", code: "FRA", lat: 50.0379, lng: 8.5622, cargo: 2280, type: "major", country: "Germany" },
        
        // Regional Hubs
        { name: "Paris", code: "CDG", lat: 49.0097, lng: 2.5479, cargo: 2180, type: "regional", country: "France" },
        { name: "London", code: "LHR", lat: 51.4700, lng: -0.4543, cargo: 1770, type: "regional", country: "UK" },
        { name: "Amsterdam", code: "AMS", lat: 52.3105, lng: 4.7683, cargo: 1740, type: "regional", country: "Netherlands" },
        { name: "Miami", code: "MIA", lat: 25.7959, lng: -80.2870, cargo: 2340, type: "regional", country: "USA" },
        { name: "Tokyo", code: "NRT", lat: 35.7720, lng: 140.3929, cargo: 2180, type: "regional", country: "Japan" },
        { name: "Singapore", code: "SIN", lat: 1.3644, lng: 103.9915, cargo: 2030, type: "regional", country: "Singapore" }
      ]

      const worldFreightRoutes = [
        { from: "HKG", to: "MEM", volume: 285, color: '#00d4ff' },
        { from: "PVG", to: "LAX", volume: 240, color: '#10b981' },
        { from: "FRA", to: "MIA", volume: 180, color: '#8b5cf6' },
        { from: "LHR", to: "MEM", volume: 165, color: '#ef4444' },
        { from: "DXB", to: "FRA", volume: 125, color: '#f97316' },
        { from: "AMS", to: "HKG", volume: 145, color: '#3b82f6' },
        { from: "NRT", to: "ANC", volume: 195, color: '#fbbf24' },
        { from: "SIN", to: "DXB", volume: 98, color: '#6366f1' }
      ]

      // Helper function to get hub by code
      const getHub = (code: string) => worldFreightHubs.find(h => h.code === code)

      // Create traces array
      const traces: any[] = []

      // Add hub markers - EXACTLY like AIFA
      worldFreightHubs.forEach(hub => {
        const isMajor = hub.type === 'major'
        const size = isMajor ? Math.max(15, hub.cargo / 150) : Math.max(10, hub.cargo / 200)
        const color = isMajor ? '#ef4444' : '#00d4ff'

        traces.push({
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
          textfont: { size: 10, color: '#ffffff', family: 'Inter' },
          showlegend: false,
          name: `${hub.name} Hub`,
          hovertemplate: `<b>${hub.name} (${hub.code})</b><br>` +
                       `Type: ${hub.type}<br>` +
                       `Cargo: ${hub.cargo}K tons/year<br>` +
                       `Country: ${hub.country}<extra></extra>`
        })

        // Add glow effect for major hubs
        if (isMajor) {
          traces.push({
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

      // Add route lines - EXACTLY like AIFA
      worldFreightRoutes.forEach(route => {
        const fromHub = getHub(route.from)
        const toHub = getHub(route.to)
        
        if (fromHub && toHub) {
          traces.push({
            type: 'scattergeo',
            lat: [fromHub.lat, toHub.lat],
            lon: [fromHub.lng, toHub.lng],
            mode: 'lines',
            line: {
              width: Math.max(2, route.volume / 50),
              color: route.color,
              opacity: 0.8
            },
            showlegend: false,
            name: `${route.from} → ${route.to}`,
            hovertemplate: `<b>${route.from} → ${route.to}</b><br>` +
                         `Volume: ${route.volume}K tons/year<extra></extra>`
          })
        }
      })

      // Layout - EXACTLY like AIFA working config
      const layout = {
        geo: {
          scope: 'world',
          projection: {
            type: 'orthographic',
            rotation: { lat: 20, lon: -30, roll: 0 }
          },
          showland: true,
          landcolor: 'rgba(30, 40, 60, 0.9)',
          showocean: true,
          oceancolor: 'rgba(10, 20, 40, 0.95)',
          showcountries: true,
          countrycolor: 'rgba(0, 212, 255, 0.3)',
          countrywidth: 0.5,
          coastlinecolor: 'rgba(0, 212, 255, 0.5)',
          coastlinewidth: 1,
          showlakes: true,
          lakecolor: 'rgba(10, 20, 40, 0.9)',
          bgcolor: 'transparent',
          showframe: false,
          showrivers: false,
          rivercolor: 'rgba(0, 212, 255, 0.2)'
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { 
          color: '#ffffff', 
          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' 
        },
        margin: { l: 0, r: 0, t: 0, b: 0 },
        showlegend: false,
        height: 600
      }

      // Config - EXACTLY like AIFA
      const config = {
        responsive: true,
        displayModeBar: false,
        scrollZoom: true,
        doubleClick: 'reset'
      }

      // Render - EXACTLY like AIFA
      ;(window as any).Plotly.newPlot(plotRef.current, traces, layout, config)
        .then(() => {
          console.log('✅ World Freight Globe rendered successfully!')
        })
        .catch((err: any) => {
          console.error('Globe render error:', err)
        })
    }

    loadPlotly()
  }, [])

  if (!isLoaded) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-cyan-400">Loading World Freight Globe...</p>
          <p className="text-xs text-gray-400">Based on AIFA Technology</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Success indicator */}
      <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-lg">
        <p className="text-sm text-green-400 font-medium text-center">
          ✅ NUEVA VERSION DESPLEGADA - AIFA Globe Technology
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="text-sm text-gray-300">
          🌍 <strong>14</strong> Hubs • 
          🛫 <strong>8</strong> Rutas • 
          📦 <strong>30,000+</strong>K tons/año
        </div>
        <div className="text-xs text-cyan-400">
          🖱️ Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* Globe container */}
      <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
        <div ref={plotRef} style={{ width: '100%', height: '600px' }} />
      </div>
    </div>
  )
}