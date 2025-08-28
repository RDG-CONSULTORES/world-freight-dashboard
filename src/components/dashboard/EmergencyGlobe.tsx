'use client'

import { useEffect } from 'react'

export default function EmergencyGlobe() {
  useEffect(() => {
    // Insert the working AIFA code directly into the page
    const container = document.getElementById('emergency-globe-container')
    if (container) {
      container.innerHTML = `
        <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <p style="color: #22c55e; text-align: center; font-size: 14px; font-weight: 500;">
            🚨 EMERGENCY MODE - Direct AIFA Implementation
          </p>
        </div>
        <div id="plotly-globe" style="width: 100%; height: 600px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; border: 1px solid rgba(71, 85, 105, 0.5);"></div>
        <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
        <script>
          setTimeout(() => {
            if (window.Plotly) {
              const hubs = [
                { name: "Memphis", code: "MEM", lat: 35.0424, lng: -89.9767, cargo: 4613, type: "major" },
                { name: "Hong Kong", code: "HKG", lat: 22.3080, lng: 113.9185, cargo: 4520, type: "major" },
                { name: "Shanghai", code: "PVG", lat: 31.1443, lng: 121.8083, cargo: 3630, type: "major" },
                { name: "Anchorage", code: "ANC", lat: 61.1744, lng: -149.9961, cargo: 3162, type: "major" },
                { name: "Dubai", code: "DXB", lat: 25.2532, lng: 55.3657, cargo: 2650, type: "major" },
                { name: "Frankfurt", code: "FRA", lat: 50.0379, lng: 8.5622, cargo: 2280, type: "major" }
              ];

              const routes = [
                { from: [22.3080, 113.9185], to: [35.0424, -89.9767], color: '#00d4ff' },
                { from: [31.1443, 121.8083], to: [34.0522, -118.2437], color: '#10b981' },
                { from: [50.0379, 8.5622], to: [25.7959, -80.2870], color: '#8b5cf6' }
              ];

              const traces = [];
              
              hubs.forEach(hub => {
                traces.push({
                  type: 'scattergeo',
                  lat: [hub.lat],
                  lon: [hub.lng],
                  text: [hub.name],
                  mode: 'markers+text',
                  marker: {
                    size: hub.type === 'major' ? 30 : 20,
                    color: hub.type === 'major' ? '#ef4444' : '#00d4ff',
                    line: { width: 2, color: '#ffffff' },
                    opacity: 0.9
                  },
                  textposition: 'top center',
                  textfont: { size: 10, color: '#ffffff' },
                  showlegend: false
                });
              });

              routes.forEach(route => {
                traces.push({
                  type: 'scattergeo',
                  lat: [route.from[0], route.to[0]],
                  lon: [route.from[1], route.to[1]],
                  mode: 'lines',
                  line: { width: 3, color: route.color, opacity: 0.8 },
                  showlegend: false
                });
              });

              const layout = {
                geo: {
                  scope: 'world',
                  projection: { type: 'orthographic', rotation: { lat: 20, lon: -30, roll: 0 } },
                  showland: true,
                  landcolor: 'rgba(30, 40, 60, 0.9)',
                  showocean: true,
                  oceancolor: 'rgba(10, 20, 40, 0.95)',
                  showcountries: true,
                  countrycolor: 'rgba(0, 212, 255, 0.3)',
                  bgcolor: 'transparent',
                  showframe: false
                },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { color: '#ffffff' },
                margin: { l: 0, r: 0, t: 0, b: 0 },
                showlegend: false,
                height: 600
              };

              const config = {
                responsive: true,
                displayModeBar: false,
                scrollZoom: true,
                doubleClick: 'reset'
              };

              Plotly.newPlot('plotly-globe', traces, layout, config);
              console.log('🚨 Emergency globe rendered successfully!');
            }
          }, 1000);
        </script>
      `
    }
  }, [])

  return (
    <div className="w-full">
      <div id="emergency-globe-container"></div>
    </div>
  )
}