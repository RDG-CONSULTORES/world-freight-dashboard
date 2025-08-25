'use client'

import React, { useState } from 'react'
import { ToggleLeft, ToggleRight } from 'lucide-react'
import Globe3DEnhanced from './Globe3DEnhanced'
import PlotlyGlobe from './PlotlyGlobe'

export default function GlobeToggle() {
  const [useEnhanced, setUseEnhanced] = useState(false)

  return (
    <div className="w-full space-y-4">
      {/* Toggle Controls */}
      <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Globe Version:</span>
          <button
            onClick={() => setUseEnhanced(false)}
            className={`px-3 py-1.5 text-sm rounded transition-all ${
              !useEnhanced 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Three.js (Current)
          </button>
          <button
            onClick={() => setUseEnhanced(true)}
            className={`px-3 py-1.5 text-sm rounded transition-all ${
              useEnhanced 
                ? 'bg-green-600 text-white' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Plotly (Real Maps) ✨
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {useEnhanced ? (
            <ToggleRight className="w-5 h-5 text-green-500" />
          ) : (
            <ToggleLeft className="w-5 h-5 text-blue-500" />
          )}
          <span className="text-xs text-muted-foreground">
            {useEnhanced ? 'Enhanced Version' : 'Original Version'}
          </span>
        </div>
      </div>

      {/* Globe Component */}
      <div className="relative">
        {useEnhanced ? (
          <div>
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400 font-medium">
                ✅ Enhanced Plotly Globe - Shows real world continents and countries
              </p>
            </div>
            <PlotlyGlobe />
          </div>
        ) : (
          <Globe3DEnhanced />
        )}
      </div>
    </div>
  )
}