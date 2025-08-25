'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import * as THREE from 'three'
import { Info, Plane, MapPin, Globe, Maximize2, RotateCcw } from 'lucide-react'

// Type definitions
interface TradeRoute {
  origin: { lat: number; lng: number; name: string; code: string; city: string; country: string }
  destination: { lat: number; lng: number; name: string; code: string; city: string; country: string }
  volume: number
  value: number
  color: string
  flights: number
  distance: number
}

interface Airport {
  code: string
  name: string
  city: string
  country: string
  lat: number
  lng: number
  type: 'major-hub' | 'regional-hub' | 'international' | 'domestic'
  flights: number
  cargo: number
  continent: string
}

interface Aircraft {
  id: string
  route: TradeRoute
  progress: number
  position: THREE.Vector3
  speed: number
}

// Major global aviation hubs - Top 25 busiest cargo airports
const MAJOR_AIRPORTS: Airport[] = [
  // North America - Major Hubs
  { code: 'MEM', name: 'Memphis International', city: 'Memphis', country: 'USA', lat: 35.0424, lng: -89.9767, type: 'major-hub', flights: 1850, cargo: 4613000, continent: 'North America' },
  { code: 'ANC', name: 'Ted Stevens Anchorage', city: 'Anchorage', country: 'USA', lat: 61.1744, lng: -149.9961, type: 'major-hub', flights: 890, cargo: 3162000, continent: 'North America' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, type: 'major-hub', flights: 1520, cargo: 2268000, continent: 'North America' },
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', lat: 40.6413, lng: -73.7781, type: 'major-hub', flights: 1420, cargo: 1525000, continent: 'North America' },
  { code: 'ORD', name: 'O\'Hare International', city: 'Chicago', country: 'USA', lat: 41.9742, lng: -87.9073, type: 'major-hub', flights: 1680, cargo: 1435000, continent: 'North America' },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', lat: 25.7959, lng: -80.2870, type: 'regional-hub', flights: 980, cargo: 2340000, continent: 'North America' },

  // Europe - Major Hubs  
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom', lat: 51.4700, lng: -0.4543, type: 'major-hub', flights: 1380, cargo: 1770000, continent: 'Europe' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622, type: 'major-hub', flights: 1450, cargo: 2280000, continent: 'Europe' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479, type: 'major-hub', flights: 1290, cargo: 2180000, continent: 'Europe' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lng: 4.7683, type: 'major-hub', flights: 1120, cargo: 1740000, continent: 'Europe' },
  { code: 'LGG', name: 'Liège Airport', city: 'Liège', country: 'Belgium', lat: 50.6374, lng: 5.4432, type: 'regional-hub', flights: 340, cargo: 1040000, continent: 'Europe' },

  // Asia-Pacific - Major Hubs
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong SAR', lat: 22.3080, lng: 113.9185, type: 'major-hub', flights: 1680, cargo: 4520000, continent: 'Asia' },
  { code: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai', country: 'China', lat: 31.1443, lng: 121.8083, type: 'major-hub', flights: 1890, cargo: 3630000, continent: 'Asia' },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', lat: 37.4602, lng: 126.4407, type: 'major-hub', flights: 1520, cargo: 2840000, continent: 'Asia' },
  { code: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', country: 'Japan', lat: 35.7720, lng: 140.3929, type: 'major-hub', flights: 1380, cargo: 2180000, continent: 'Asia' },
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915, type: 'major-hub', flights: 1560, cargo: 2030000, continent: 'Asia' },
  { code: 'TPE', name: 'Taiwan Taoyuan', city: 'Taipei', country: 'Taiwan', lat: 25.0797, lng: 121.2342, type: 'regional-hub', flights: 1240, cargo: 2230000, continent: 'Asia' },

  // Middle East & Africa
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', lat: 25.2532, lng: 55.3657, type: 'major-hub', flights: 1750, cargo: 2650000, continent: 'Middle East' },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', lat: 25.2731, lng: 51.6080, type: 'regional-hub', flights: 920, cargo: 1450000, continent: 'Middle East' },

  // South America & Oceania
  { code: 'GRU', name: 'São Paulo–Guarulhos', city: 'São Paulo', country: 'Brazil', lat: -23.4356, lng: -46.4731, type: 'regional-hub', flights: 780, cargo: 580000, continent: 'South America' },
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia', lat: -33.9399, lng: 151.1753, type: 'regional-hub', flights: 890, cargo: 580000, continent: 'Oceania' }
]

// Major trade routes based on real cargo data
const TRADE_ROUTES: TradeRoute[] = [
  // Trans-Pacific Powerhouses
  {
    origin: { lat: 22.3080, lng: 113.9185, name: 'Hong Kong International', code: 'HKG', city: 'Hong Kong', country: 'Hong Kong SAR' },
    destination: { lat: 35.0424, lng: -89.9767, name: 'Memphis International', code: 'MEM', city: 'Memphis', country: 'USA' },
    volume: 285000, value: 8400000, color: '#00bcd4', flights: 45, distance: 17089
  },
  {
    origin: { lat: 31.1443, lng: 121.8083, name: 'Shanghai Pudong', code: 'PVG', city: 'Shanghai', country: 'China' },
    destination: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles International', code: 'LAX', city: 'Los Angeles', country: 'USA' },
    volume: 240000, value: 7200000, color: '#4caf50', flights: 42, distance: 11630
  },
  {
    origin: { lat: 35.7720, lng: 140.3929, name: 'Tokyo Narita', code: 'NRT', city: 'Tokyo', country: 'Japan' },
    destination: { lat: 61.1744, lng: -149.9961, name: 'Ted Stevens Anchorage', code: 'ANC', city: 'Anchorage', country: 'USA' },
    volume: 195000, value: 5850000, color: '#ff9800', flights: 38, distance: 5520
  },

  // Trans-Atlantic Corridors  
  {
    origin: { lat: 50.0379, lng: 8.5622, name: 'Frankfurt Airport', code: 'FRA', city: 'Frankfurt', country: 'Germany' },
    destination: { lat: 40.6413, lng: -73.7781, name: 'JFK International', code: 'JFK', city: 'New York', country: 'USA' },
    volume: 180000, value: 6300000, color: '#9c27b0', flights: 35, distance: 6194
  },
  {
    origin: { lat: 51.4700, lng: -0.4543, name: 'London Heathrow', code: 'LHR', city: 'London', country: 'UK' },
    destination: { lat: 41.9742, lng: -87.9073, name: 'O\'Hare International', code: 'ORD', city: 'Chicago', country: 'USA' },
    volume: 165000, value: 5400000, color: '#f44336', flights: 32, distance: 6363
  },

  // Europe-Asia Silk Road
  {
    origin: { lat: 52.3105, lng: 4.7683, name: 'Amsterdam Schiphol', code: 'AMS', city: 'Amsterdam', country: 'Netherlands' },
    destination: { lat: 22.3080, lng: 113.9185, name: 'Hong Kong International', code: 'HKG', city: 'Hong Kong', country: 'Hong Kong SAR' },
    volume: 145000, value: 4800000, color: '#3f51b5', flights: 28, distance: 10758
  },

  // Middle East Gateway
  {
    origin: { lat: 25.2532, lng: 55.3657, name: 'Dubai International', code: 'DXB', city: 'Dubai', country: 'UAE' },
    destination: { lat: 50.0379, lng: 8.5622, name: 'Frankfurt Airport', code: 'FRA', city: 'Frankfurt', country: 'Germany' },
    volume: 125000, value: 3750000, color: '#ff5722', flights: 25, distance: 4947
  },
  {
    origin: { lat: 1.3644, lng: 103.9915, name: 'Singapore Changi', code: 'SIN', city: 'Singapore', country: 'Singapore' },
    destination: { lat: 25.2532, lng: 55.3657, name: 'Dubai International', code: 'DXB', city: 'Dubai', country: 'UAE' },
    volume: 98000, value: 2940000, color: '#795548', flights: 22, distance: 6069
  }
]

const Globe3DEnhanced: React.FC = () => {
  // Refs for Three.js objects
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene())
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const globeRef = useRef<THREE.Mesh>()
  const atmosphereRef = useRef<THREE.Mesh>()
  const cloudsRef = useRef<THREE.Mesh>()
  const frameRef = useRef<number>()

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<TradeRoute | null>(null)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showAirports, setShowAirports] = useState(true)
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [controls, setControls] = useState({
    autoRotate: true,
    showStats: false,
    showLabels: true
  })

  // Utility functions
  const latLngToVector3 = useCallback((lat: number, lng: number, radius: number = 5): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    )
  }, [])

  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }, [])

  // Create Earth with realistic textures
  const createEarth = useCallback(() => {
    // Earth geometry
    const geometry = new THREE.SphereGeometry(5, 64, 32)

    // Load textures (we'll use procedural textures for now)
    const textureLoader = new THREE.TextureLoader()
    
    // Create a simple earth-like material with shader
    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        dayTexture: { value: null },
        nightTexture: { value: null }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        // Simple procedural earth colors
        vec3 getEarthColor(vec2 uv) {
          float landMask = sin(uv.x * 20.0) * cos(uv.y * 10.0);
          landMask += sin(uv.x * 35.0 + time * 0.1) * 0.3;
          landMask += cos(uv.y * 25.0) * 0.2;
          
          vec3 oceanColor = vec3(0.1, 0.3, 0.8);
          vec3 landColor = vec3(0.2, 0.6, 0.2);
          vec3 desertColor = vec3(0.8, 0.7, 0.3);
          
          // Mix colors based on coordinates and noise
          vec3 color = mix(oceanColor, landColor, smoothstep(-0.2, 0.3, landMask));
          
          // Add desert regions
          if (abs(vUv.y - 0.3) < 0.1 || abs(vUv.y - 0.7) < 0.1) {
            color = mix(color, desertColor, 0.6);
          }
          
          return color;
        }
        
        void main() {
          vec3 earthColor = getEarthColor(vUv);
          
          // Add atmosphere glow
          float atmosphere = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 atmosphereColor = vec3(0.3, 0.6, 1.0) * atmosphere;
          
          gl_FragColor = vec4(earthColor + atmosphereColor * 0.3, 1.0);
        }
      `
    })

    const earth = new THREE.Mesh(geometry, earthMaterial)
    earth.name = 'earth'
    return earth
  }, [])

  // Create atmosphere glow
  const createAtmosphere = useCallback(() => {
    const geometry = new THREE.SphereGeometry(5.3, 64, 32)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.8 },
        p: { value: 3.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float c;
        uniform float p;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    })

    return new THREE.Mesh(geometry, material)
  }, [])

  // Create clouds layer
  const createClouds = useCallback(() => {
    const geometry = new THREE.SphereGeometry(5.1, 64, 32)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return sin(p.x * 10.0 + time * 0.5) * cos(p.y * 8.0 + time * 0.3) * 0.5 + 0.5;
        }
        
        void main() {
          float clouds = noise(vUv * 3.0);
          clouds = smoothstep(0.4, 0.8, clouds);
          gl_FragColor = vec4(1.0, 1.0, 1.0, clouds * 0.3);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })

    return new THREE.Mesh(geometry, material)
  }, [])

  // Create airport markers
  const createAirportMarkers = useCallback(() => {
    const airportGroup = new THREE.Group()
    airportGroup.name = 'airports'

    MAJOR_AIRPORTS.forEach(airport => {
      const position = latLngToVector3(airport.lat, airport.lng, 5.05)
      
      // Different sizes and colors based on airport type
      let size = 0.08
      let color = '#ffffff'
      
      switch (airport.type) {
        case 'major-hub':
          size = 0.12
          color = '#ff6b35'
          break
        case 'regional-hub':
          size = 0.10
          color = '#f7931e'
          break
        case 'international':
          size = 0.08
          color = '#06b6d4'
          break
        default:
          size = 0.06
          color = '#94a3b8'
      }

      // Create marker geometry
      const geometry = new THREE.SphereGeometry(size, 16, 8)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.9
      })

      const marker = new THREE.Mesh(geometry, material)
      marker.position.copy(position)
      marker.userData = { airport, type: 'airport' }
      marker.name = `airport-${airport.code}`

      // Add glow ring for major hubs
      if (airport.type === 'major-hub') {
        const ringGeometry = new THREE.RingGeometry(size * 1.5, size * 2, 16)
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        })
        const ring = new THREE.Mesh(ringGeometry, ringMaterial)
        ring.position.copy(position)
        ring.lookAt(new THREE.Vector3(0, 0, 0))
        airportGroup.add(ring)
      }

      airportGroup.add(marker)
    })

    return airportGroup
  }, [latLngToVector3])

  // Create trade route lines with aircraft
  const createTradeRoutes = useCallback(() => {
    const routeGroup = new THREE.Group()
    routeGroup.name = 'routes'
    const newAircraft: Aircraft[] = []

    TRADE_ROUTES.forEach((route, index) => {
      const originPos = latLngToVector3(route.origin.lat, route.origin.lng, 5.05)
      const destPos = latLngToVector3(route.destination.lat, route.destination.lng, 5.05)
      
      // Create curved path for great circle route
      const curve = new THREE.QuadraticBezierCurve3(
        originPos,
        originPos.clone().add(destPos).normalize().multiplyScalar(7), // Higher arc
        destPos
      )

      // Create route line
      const points = curve.getPoints(100)
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(route.color),
        transparent: true,
        opacity: 0.6,
        linewidth: 2
      })

      const line = new THREE.Line(geometry, material)
      line.userData = { route, type: 'route' }
      line.name = `route-${route.origin.code}-${route.destination.code}`
      routeGroup.add(line)

      // Add animated aircraft on routes
      for (let i = 0; i < Math.min(route.flights / 15, 4); i++) {
        const aircraftGeometry = new THREE.ConeGeometry(0.03, 0.1, 4)
        const aircraftMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(route.color),
          transparent: true,
          opacity: 0.8
        })
        
        const aircraftMesh = new THREE.Mesh(aircraftGeometry, aircraftMaterial)
        aircraftMesh.name = `aircraft-${route.origin.code}-${route.destination.code}-${i}`
        
        const aircraft: Aircraft = {
          id: `${route.origin.code}-${route.destination.code}-${i}`,
          route,
          progress: i * 0.25, // Spread aircraft along route
          position: new THREE.Vector3(),
          speed: 0.002 + Math.random() * 0.001
        }
        
        newAircraft.push(aircraft)
        routeGroup.add(aircraftMesh)
      }
    })

    setAircraft(newAircraft)
    return routeGroup
  }, [latLngToVector3])

  // Animation loop
  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return

    // Update earth rotation if auto-rotate is enabled
    if (controls.autoRotate && globeRef.current) {
      globeRef.current.rotation.y += 0.001
    }

    // Update clouds rotation
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0005
    }

    // Update shader uniforms
    if (globeRef.current && 'uniforms' in globeRef.current.material) {
      (globeRef.current.material as any).uniforms.time.value += 0.01
    }

    if (cloudsRef.current && 'uniforms' in cloudsRef.current.material) {
      (cloudsRef.current.material as any).uniforms.time.value += 0.01
    }

    // Animate aircraft
    aircraft.forEach(aircraft => {
      aircraft.progress += aircraft.speed
      if (aircraft.progress > 1) aircraft.progress = 0

      // Get position along route curve
      const originPos = latLngToVector3(aircraft.route.origin.lat, aircraft.route.origin.lng, 5.05)
      const destPos = latLngToVector3(aircraft.route.destination.lat, aircraft.route.destination.lng, 5.05)
      
      const curve = new THREE.QuadraticBezierCurve3(
        originPos,
        originPos.clone().add(destPos).normalize().multiplyScalar(7),
        destPos
      )

      const position = curve.getPoint(aircraft.progress)
      const nextPosition = curve.getPoint(Math.min(aircraft.progress + 0.01, 1))
      
      aircraft.position.copy(position)
      
      // Update mesh position and orientation
      const aircraftMesh = sceneRef.current?.getObjectByName(`aircraft-${aircraft.id}`)
      if (aircraftMesh) {
        aircraftMesh.position.copy(position)
        aircraftMesh.lookAt(nextPosition)
      }
    })

    rendererRef.current.render(sceneRef.current, cameraRef.current)
    frameRef.current = requestAnimationFrame(animate)
  }, [controls.autoRotate, aircraft, latLngToVector3])

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 12)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance' 
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    containerRef.current.appendChild(renderer.domElement)

    // Scene setup
    const scene = sceneRef.current
    scene.fog = new THREE.Fog(0x000000, 15, 25)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Create Earth components
    const earth = createEarth()
    const atmosphere = createAtmosphere()
    const clouds = createClouds()
    
    globeRef.current = earth
    atmosphereRef.current = atmosphere  
    cloudsRef.current = clouds
    
    scene.add(earth)
    scene.add(atmosphere)
    scene.add(clouds)

    // Add airports and routes
    if (showAirports) {
      scene.add(createAirportMarkers())
    }
    
    if (showRoutes) {
      scene.add(createTradeRoutes())
    }

    // Mouse controls
    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0
    let targetRotationY = 0

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      if (!controls.autoRotate) {
        targetRotationX = mouseY * 0.5
        targetRotationY = mouseX * 0.5
      }
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      camera.position.z += event.deltaY * 0.01
      camera.position.z = Math.max(8, Math.min(20, camera.position.z))
    }

    containerRef.current.addEventListener('mousemove', handleMouseMove)
    containerRef.current.addEventListener('wheel', handleWheel, { passive: false })

    // Animation loop
    const animateLoop = () => {
      if (!controls.autoRotate && earth) {
        earth.rotation.x += (targetRotationX - earth.rotation.x) * 0.05
        earth.rotation.y += (targetRotationY - earth.rotation.y) * 0.05
      }
      
      animate()
    }

    frameRef.current = requestAnimationFrame(animateLoop)
    setIsLoading(false)

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [animate, controls.autoRotate, createEarth, createAtmosphere, createClouds, createAirportMarkers, createTradeRoutes, showAirports, showRoutes])

  // Control handlers
  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 12)
    }
  }

  const toggleAutoRotate = () => {
    setControls(prev => ({ ...prev, autoRotate: !prev.autoRotate }))
  }

  const toggleRoutes = () => {
    setShowRoutes(prev => !prev)
  }

  const toggleAirports = () => {
    setShowAirports(prev => !prev)
  }

  return (
    <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-white text-center">
            <Globe className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Loading Earth...</p>
          </div>
        </div>
      )}

      {/* 3D Globe Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Controls Panel */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button
          onClick={toggleAutoRotate}
          className={`p-2 rounded-lg backdrop-blur-sm transition-all ${
            controls.autoRotate 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-gray-800/50 text-gray-400'
          }`}
          title={controls.autoRotate ? 'Disable Auto Rotation' : 'Enable Auto Rotation'}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        <button
          onClick={resetView}
          className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 transition-all"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={toggleRoutes}
          className={`p-2 rounded-lg backdrop-blur-sm transition-all ${
            showRoutes 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-800/50 text-gray-400'
          }`}
          title={showRoutes ? 'Hide Routes' : 'Show Routes'}
        >
          <Plane className="w-4 h-4" />
        </button>
        
        <button
          onClick={toggleAirports}
          className={`p-2 rounded-lg backdrop-blur-sm transition-all ${
            showAirports 
              ? 'bg-orange-500/20 text-orange-400' 
              : 'bg-gray-800/50 text-gray-400'
          }`}
          title={showAirports ? 'Hide Airports' : 'Show Airports'}
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Panel */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="text-xs space-y-1">
          <div>🛫 Active Routes: {TRADE_ROUTES.length}</div>
          <div>🏢 Major Hubs: {MAJOR_AIRPORTS.filter(a => a.type === 'major-hub').length}</div>
          <div>✈️ Aircraft: {aircraft.length}</div>
          <div>📊 Total Cargo: {formatNumber(MAJOR_AIRPORTS.reduce((sum, a) => sum + a.cargo, 0))} tons</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="text-xs space-y-2">
          <div className="font-semibold mb-2">Legend</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Major Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>Regional Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
            <span>International</span>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white max-w-xs">
        <div className="text-xs">
          <div className="flex items-center gap-1 mb-2">
            <Info className="w-3 h-3" />
            <span className="font-semibold">Global Trade Routes</span>
          </div>
          <p>Interactive 3D visualization of major cargo routes and aviation hubs worldwide. Mouse to rotate, scroll to zoom.</p>
        </div>
      </div>
    </div>
  )
}

export default Globe3DEnhanced