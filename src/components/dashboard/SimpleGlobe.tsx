'use client'

import React, { useEffect, useRef } from 'react'

export default function SimpleGlobe() {
  const plotRef = useRef<HTMLDivElement>(null)

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
        // Data
        const hubs = [
          { name: "Memphis", lat: 35.0424, lng: -89.9767, size: 40 },
          { name: "Hong Kong", lat: 22.3080, lng: 113.9185, size: 40 },
          { name: "Shanghai", lat: 31.1443, lng: 121.8083, size: 35 },
          { name: "Anchorage", lat: 61.1744, lng: -149.9961, size: 35 },
          { name: "Dubai", lat: 25.2532, lng: 55.3657, size: 30 },
          { name: "Frankfurt", lat: 50.0379, lng: 8.5622, size: 30 },
          { name: "Los Angeles", lat: 34.0522, lng: -118.2437, size: 30 },
          { name: "Paris", lat: 49.0097, lng: 2.5479, size: 25 },
          { name: "London", lat: 51.4700, lng: -0.4543, size: 25 },
          { name: "Amsterdam", lat: 52.3105, lng: 4.7683, size: 25 }
        ]

        const routes = [
          { from: [22.3080, 113.9185], to: [35.0424, -89.9767] },
          { from: [31.1443, 121.8083], to: [34.0522, -118.2437] },
          { from: [50.0379, 8.5622], to: [25.7959, -80.2870] },
          { from: [51.4700, -0.4543], to: [35.0424, -89.9767] },
          { from: [25.2532, 55.3657], to: [50.0379, 8.5622] }
        ]

        // Create traces
        const data: any[] = []

        // Add hub markers
        hubs.forEach(hub => {
          data.push({
            type: 'scattergeo',
            lat: [hub.lat],
            lon: [hub.lng],
            text: [hub.name],
            mode: 'markers+text',
            marker: {
              size: hub.size,
              color: hub.size > 30 ? '#ef4444' : '#06b6d4',
              line: { width: 2, color: '#ffffff' },
              opacity: 0.9
            },
            textposition: 'top center',
            textfont: { size: 10, color: '#ffffff', family: 'Inter' },
            showlegend: false
          })
        })

        // Add routes
        routes.forEach(route => {
          data.push({
            type: 'scattergeo',
            lat: [route.from[0], route.to[0]],
            lon: [route.from[1], route.to[1]],
            mode: 'lines',
            line: {
              width: 3,
              color: '#06b6d4',
              opacity: 0.7
            },
            showlegend: false
          })
        })

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
  }, [])

  return (
    <div className="w-full space-y-4">
      {/* Simple status */}
      <div className="p-3 bg-blue-500/20 border border-blue-500/40 rounded-lg">
        <p className="text-sm text-blue-400 font-medium text-center">
          🌍 World Freight Globe Loading...
        </p>
      </div>

      {/* Globe container */}
      <div className="bg-slate-900/30 rounded-lg border border-slate-600 overflow-hidden">
        <div ref={plotRef} style={{ width: '100%', height: '600px' }} />
      </div>

      {/* Controls info */}
      <div className="text-center text-sm text-gray-400">
        🖱️ Drag to rotate • Scroll to zoom • Double-click to reset
      </div>
    </div>
  )
}