'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Settings,
  MapPin,
  Plane,
  Activity
} from 'lucide-react'

interface Airport {
  name: string
  code: string
  lat: number
  lng: number
  traffic: number
  type: 'hub' | 'regional' | 'international'
}

interface Route {
  from: Airport
  to: Airport
  flights: number
  cargo: number
  revenue: number
}

const Globe3D = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const globeRef = useRef<THREE.Mesh>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const routesGroupRef = useRef<THREE.Group>()
  const markersGroupRef = useRef<THREE.Group>()
  const animationRef = useRef<number>()
  
  const [isRotating, setIsRotating] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Sample airports data
  const airports: Airport[] = [
    { name: 'Los Angeles International', code: 'LAX', lat: 33.9425, lng: -118.4081, traffic: 87.5, type: 'hub' },
    { name: 'John F. Kennedy International', code: 'JFK', lat: 40.6413, lng: -73.7781, traffic: 62.6, type: 'international' },
    { name: 'London Heathrow', code: 'LHR', lat: 51.4700, lng: -0.4543, traffic: 80.9, type: 'hub' },
    { name: 'Frankfurt Airport', code: 'FRA', lat: 50.0379, lng: 8.5622, traffic: 70.6, type: 'hub' },
    { name: 'Tokyo Narita', code: 'NRT', lat: 35.7720, lng: 140.3929, traffic: 42.9, type: 'international' },
    { name: 'Singapore Changi', code: 'SIN', lat: 1.3644, lng: 103.9915, traffic: 68.3, type: 'hub' },
    { name: 'Dubai International', code: 'DXB', lat: 25.2532, lng: 55.3657, traffic: 86.4, type: 'hub' },
    { name: 'Hong Kong International', code: 'HKG', lat: 22.3080, lng: 113.9185, traffic: 74.7, type: 'international' },
    { name: 'São Paulo–Guarulhos', code: 'GRU', lat: -23.4356, lng: -46.4731, traffic: 42.1, type: 'regional' },
    { name: 'Sydney Kingsford Smith', code: 'SYD', lat: -33.9399, lng: 151.1753, traffic: 44.4, type: 'international' },
  ]

  // Generate routes between major airports
  const generateRoutes = (): Route[] => {
    const routes: Route[] = []
    const majorHubs = airports.filter(a => a.type === 'hub')
    
    majorHubs.forEach(hub => {
      airports.forEach(destination => {
        if (hub !== destination && Math.random() > 0.6) {
          routes.push({
            from: hub,
            to: destination,
            flights: Math.floor(Math.random() * 20) + 5,
            cargo: Math.floor(Math.random() * 5000) + 1000,
            revenue: Math.floor(Math.random() * 1000000) + 500000
          })
        }
      })
    })
    
    return routes
  }

  const [routes] = useState<Route[]>(generateRoutes())

  // Convert lat/lng to 3D coordinates
  const latLngToVector3 = (lat: number, lng: number, radius: number = 2): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    )
  }

  // Create globe geometry
  const createGlobe = () => {
    const geometry = new THREE.SphereGeometry(2, 64, 64)
    
    // Create earth-like material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        oceanColor: { value: new THREE.Color(0x006994) },
        landColor: { value: new THREE.Color(0x2c5f2d) },
        atmosphereColor: { value: new THREE.Color(0x4a90e2) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 oceanColor;
        uniform vec3 landColor;
        uniform vec3 atmosphereColor;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        float noise(vec2 p) {
          return sin(p.x * 10.0) * sin(p.y * 10.0);
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Create land/ocean pattern
          float landMask = step(0.3, noise(uv * 8.0 + time * 0.01));
          vec3 color = mix(oceanColor, landColor, landMask);
          
          // Add atmosphere glow
          float fresnel = pow(1.0 - dot(normalize(vPosition), vec3(0.0, 0.0, 1.0)), 2.0);
          color = mix(color, atmosphereColor, fresnel * 0.3);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    })
    
    return new THREE.Mesh(geometry, material)
  }

  // Create airport markers
  const createAirportMarkers = () => {
    const group = new THREE.Group()
    
    airports.forEach(airport => {
      const position = latLngToVector3(airport.lat, airport.lng, 2.05)
      
      // Create marker geometry based on airport type
      let geometry: THREE.BufferGeometry
      const size = airport.type === 'hub' ? 0.08 : airport.type === 'international' ? 0.06 : 0.04
      
      if (airport.type === 'hub') {
        geometry = new THREE.ConeGeometry(size, size * 2, 8)
      } else {
        geometry = new THREE.SphereGeometry(size, 16, 16)
      }
      
      const material = new THREE.MeshBasicMaterial({
        color: airport.type === 'hub' ? 0xff6b6b : 
               airport.type === 'international' ? 0x4ecdc4 : 0xffe66d
      })
      
      const marker = new THREE.Mesh(geometry, material)
      marker.position.copy(position)
      marker.lookAt(position.clone().multiplyScalar(2))
      marker.userData = airport
      
      group.add(marker)
      
      // Add pulsing effect for high-traffic airports
      if (airport.traffic > 70) {
        const ringGeometry = new THREE.RingGeometry(size * 1.5, size * 2, 16)
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        })
        const ring = new THREE.Mesh(ringGeometry, ringMaterial)
        ring.position.copy(position)
        ring.lookAt(position.clone().multiplyScalar(2))
        group.add(ring)
      }
    })
    
    return group
  }

  // Create flight routes
  const createRoutes = () => {
    const group = new THREE.Group()
    
    routes.forEach((route, index) => {
      const startPos = latLngToVector3(route.from.lat, route.from.lng, 2.05)
      const endPos = latLngToVector3(route.to.lat, route.to.lng, 2.05)
      
      // Create curved path
      const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5)
      midPoint.normalize().multiplyScalar(2.5) // Raise the curve
      
      const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos)
      const points = curve.getPoints(50)
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL((index * 0.1) % 1, 0.7, 0.6),
        transparent: true,
        opacity: 0.6,
        linewidth: 2
      })
      
      const line = new THREE.Line(geometry, material)
      group.add(line)
      
      // Add animated particles along the route
      const particleCount = Math.floor(route.flights / 5) + 1
      for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.01, 8, 8)
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.8
        })
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial)
        const t = (i / particleCount) + (Math.random() * 0.2)
        particle.position.copy(curve.getPoint(t % 1))
        particle.userData = { curve, t, speed: 0.002 + Math.random() * 0.003 }
        
        group.add(particle)
      }
    })
    
    return group
  }

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0f1c)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 6)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer
    containerRef.current.appendChild(renderer.domElement)

    // Create globe
    const globe = createGlobe()
    globeRef.current = globe
    scene.add(globe)

    // Create airport markers
    const markersGroup = createAirportMarkers()
    markersGroupRef.current = markersGroup
    scene.add(markersGroup)

    // Create routes
    const routesGroup = createRoutes()
    routesGroupRef.current = routesGroup
    scene.add(routesGroup)

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)

    // Add stars
    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 10000
    const positions = new Float32Array(starsCount * 3)
    
    for (let i = 0; i < starsCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 2000
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    // Mouse controls
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2)
      mouseY = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    }

    containerRef.current.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      if (globeRef.current && sceneRef.current && cameraRef.current && rendererRef.current) {
        // Rotate globe
        if (isRotating) {
          globeRef.current.rotation.y += 0.002
        }

        // Mouse interaction
        targetX = mouseX * 0.5
        targetY = mouseY * 0.5
        cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.05
        cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.05
        cameraRef.current.lookAt(0, 0, 0)

        // Animate route particles
        if (routesGroupRef.current) {
          routesGroupRef.current.children.forEach(child => {
            if (child.userData.curve) {
              child.userData.t += child.userData.speed
              if (child.userData.t > 1) child.userData.t = 0
              child.position.copy(child.userData.curve.getPoint(child.userData.t))
            }
          })
        }

        // Update shader time
        if (globeRef.current.material && 'uniforms' in globeRef.current.material) {
          (globeRef.current.material as any).uniforms.time.value += 0.01
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    animate()
    setIsLoading(false)

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
      
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      
      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        containerRef.current.removeEventListener('mousemove', handleMouseMove)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [isRotating])

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 6)
      cameraRef.current.lookAt(0, 0, 0)
    }
  }

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.9)
    }
  }

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.1)
    }
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden">
      {/* 3D Globe Container */}
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-blue-400">Initializing Global View...</p>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRotating(!isRotating)}
          className="p-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-blue-500/20 transition-colors"
          title={isRotating ? "Pause Rotation" : "Resume Rotation"}
        >
          {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetView}
          className="p-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-blue-500/20 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={zoomIn}
          className="p-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-blue-500/20 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={zoomOut}
          className="p-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-blue-500/20 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20 p-4 text-sm">
        <h4 className="font-semibold mb-3 text-white">Airport Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
            <span className="text-gray-300">Major Hubs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
            <span className="text-gray-300">International</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-300">Regional</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20 p-4 text-sm">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-blue-400">{airports.length}</div>
            <div className="text-gray-300">Airports</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-400">{routes.length}</div>
            <div className="text-gray-300">Routes</div>
          </div>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20 px-3 py-2">
        <div className="pulse-dot w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="text-sm text-white">Live Tracking</span>
        <Activity className="w-4 h-4 text-green-400" />
      </div>
    </div>
  )
}

export default Globe3D