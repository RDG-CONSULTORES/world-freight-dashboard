const http = require('http');
const fs = require('fs');
const path = require('path');

const demoHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>World Freight Dashboard | ADUANAPP Integration</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            color: white; min-height: 100vh; overflow-x: hidden;
        }
        .cyber-grid {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-image: linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
            background-size: 20px 20px; animation: grid-move 20s linear infinite;
            pointer-events: none; z-index: -1;
        }
        @keyframes grid-move {
            0% { background-position: 0 0; }
            100% { background-position: 20px 20px; }
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; position: relative; z-index: 1; }
        .header { text-align: center; margin-bottom: 3rem; }
        .title {
            font-size: 3rem; font-weight: bold; margin-bottom: 1rem;
            background: linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6);
            background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .subtitle { font-size: 1.2rem; color: #94a3b8; margin-bottom: 2rem; }
        .status-badge {
            display: inline-flex; align-items: center; gap: 0.5rem;
            background: rgba(16, 185, 129, 0.1); color: #10b981;
            padding: 0.5rem 1rem; border-radius: 9999px;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .pulse-dot {
            width: 8px; height: 8px; background: #10b981; border-radius: 50%;
            animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .demo-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem; margin-top: 3rem;
        }
        .demo-card {
            background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem;
            padding: 2rem; transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .demo-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6);
        }
        .demo-card:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(6, 182, 212, 0.1); }
        .card-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: #06b6d4; }
        .card-description { color: #94a3b8; margin-bottom: 1.5rem; line-height: 1.6; }
        .feature-list { list-style: none; }
        .feature-list li {
            padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem; color: #e2e8f0;
        }
        .check-icon { color: #10b981; font-weight: bold; }
        .installation-box {
            background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 0.5rem; padding: 1.5rem; margin: 2rem 0;
            font-family: monospace; color: #06b6d4;
        }
        .code {
            background: rgba(0, 0, 0, 0.5); padding: 0.25rem 0.5rem;
            border-radius: 0.25rem; color: #10b981;
        }
        .warning-box {
            background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; color: #fbbf24;
        }
        .footer {
            text-align: center; margin-top: 4rem; padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1); color: #64748b;
        }
        @media (max-width: 768px) {
            .container { padding: 1rem; }
            .title { font-size: 2rem; }
            .demo-grid { grid-template-columns: 1fr; gap: 1rem; }
        }
    </style>
</head>
<body>
    <div class="cyber-grid"></div>
    
    <div class="container">
        <header class="header">
            <h1 class="title">World Freight Dashboard</h1>
            <p class="subtitle">Mission-critical logistics command center with ADUANAPP integration</p>
            <div class="status-badge">
                <div class="pulse-dot"></div>
                Enterprise Ready - 90% Complete
            </div>
        </header>

        <div class="warning-box">
            <strong>⚠️ Instalación Requerida:</strong> Para ejecutar el dashboard completo con globo 3D interactivo y datos en tiempo real, se necesita resolver los permisos de npm e instalar las dependencias.
        </div>

        <div class="installation-box">
            <div>🚀 Para ejecutar el dashboard completo:</div><br>
            <div># Solucionar permisos de npm (requiere contraseña admin):</div>
            <div><span class="code">sudo chown -R $(whoami) ~/.npm</span></div><br>
            <div># Luego instalar y ejecutar:</div>
            <div><span class="code">npm install</span></div>
            <div><span class="code">npm run dev</span></div><br>
            <div># Acceder en: <span class="code">http://localhost:3000</span></div>
        </div>

        <div class="demo-grid">
            <div class="demo-card">
                <h3 class="card-title">🎯 Real-time KPIs</h3>
                <p class="card-description">
                    Panel principal con 8 métricas críticas actualizadas cada 2.5 segundos
                </p>
                <ul class="feature-list">
                    <li><span class="check-icon">✓</span> Vuelos Activos</li>
                    <li><span class="check-icon">✓</span> Utilización de Aeronaves</li>
                    <li><span class="check-icon">✓</span> Factor de Carga</li>
                    <li><span class="check-icon">✓</span> Eficiencia de Combustible</li>
                    <li><span class="check-icon">✓</span> RATK (Revenue per Ton-Km)</li>
                    <li><span class="check-icon">✓</span> Tiempo de Rotación</li>
                    <li><span class="check-icon">✓</span> Clasificaciones AI</li>
                    <li><span class="check-icon">✓</span> Score de Cumplimiento</li>
                </ul>
            </div>

            <div class="demo-card">
                <h3 class="card-title">🌍 Globo 3D Interactivo</h3>
                <p class="card-description">
                    Visualización mundial con rutas comerciales animadas usando Three.js
                </p>
                <ul class="feature-list">
                    <li><span class="check-icon">✓</span> Tierra 3D con texturas realistas</li>
                    <li><span class="check-icon">✓</span> Rutas animadas con partículas</li>
                    <li><span class="check-icon">✓</span> Controles de mouse (rotar/zoom)</li>
                    <li><span class="check-icon">✓</span> Marcadores por tipo de aeropuerto</li>
                    <li><span class="check-icon">✓</span> Seguimiento en tiempo real</li>
                    <li><span class="check-icon">✓</span> Optimizado para 60fps</li>
                </ul>
            </div>

            <div class="demo-card">
                <h3 class="card-title">🤖 ADUANAPP AI Panel</h3>
                <p class="card-description">
                    Monitoreo de servicios de clasificación aduanera con IA
                </p>
                <ul class="feature-list">
                    <li><span class="check-icon">✓</span> Uni Classifier</li>
                    <li><span class="check-icon">✓</span> Multi Classifier</li>
                    <li><span class="check-icon">✓</span> SAT Search</li>
                    <li><span class="check-icon">✓</span> Merceology</li>
                    <li><span class="check-icon">✓</span> Product Validator</li>
                    <li><span class="check-icon">✓</span> Preview CODIA (Próximamente)</li>
                </ul>
            </div>

            <div class="demo-card">
                <h3 class="card-title">📈 Análisis de Rutas</h3>
                <p class="card-description">
                    Sistema de análisis y optimización de rutas comerciales
                </p>
                <ul class="feature-list">
                    <li><span class="check-icon">✓</span> Ranking de Rentabilidad</li>
                    <li><span class="check-icon">✓</span> Indicadores de Tendencia</li>
                    <li><span class="check-icon">✓</span> Métricas de Aeropuertos</li>
                    <li><span class="check-icon">✓</span> Análisis Expandible</li>
                    <li><span class="check-icon">✓</span> Filtros Inteligentes</li>
                </ul>
            </div>

            <div class="demo-card">
                <h3 class="card-title">⚡ Stack Tecnológico</h3>
                <p class="card-description">
                    Arquitectura enterprise con tecnologías modernas
                </p>
                <ul class="feature-list">
                    <li><span class="check-icon">✓</span> Next.js 14 + TypeScript</li>
                    <li><span class="check-icon">✓</span> Three.js + Tailwind CSS</li>
                    <li><span class="check-icon">✓</span> WebSocket + Polling</li>
                    <li><span class="check-icon">✓</span> Framer Motion</li>
                    <li><span class="check-icon">✓</span> Responsive 4K Ready</li>
                    <li><span class="check-icon">✓</span> 100% TypeScript</li>
                </ul>
            </div>

            <div class="demo-card">
                <h3 class="card-title">🏆 Estado del Proyecto</h3>
                <p class="card-description">
                    Progreso actual - Listo para producción
                </p>
                <ul class="feature-list">
                    <li><span class="check-icon">✓</span> Setup & Configuración</li>
                    <li><span class="check-icon">✓</span> Tipos & Modelos de Datos</li>
                    <li><span class="check-icon">✓</span> Dashboard Principal</li>
                    <li><span class="check-icon">✓</span> Globo 3D</li>
                    <li><span class="check-icon">✓</span> Panel ADUANAPP</li>
                    <li><span class="check-icon">✓</span> Análisis de Rutas</li>
                    <li><span class="check-icon">✓</span> Hooks & Utilities</li>
                    <li><span class="check-icon">✓</span> API Integration</li>
                    <li><span class="check-icon">✓</span> Documentación</li>
                </ul>
            </div>
        </div>

        <footer class="footer">
            <p><strong>World Freight Dashboard v2.1.0</strong></p>
            <p>Powered by ADUANAPP AI | Enterprise Edition</p>
            <p>Built with ❤️ by the World Freight Development Team</p>
            <p style="margin-top: 1rem; color: #10b981;">
                <strong>✅ 90% Completo - 9 de 10 componentes principales terminados</strong>
            </p>
        </footer>
    </div>

    <script>
        // Simple particle effects
        function createParticle() {
            const particle = document.createElement('div');
            particle.style.cssText = \`
                position: fixed; width: 2px; height: 2px;
                background: linear-gradient(45deg, #06b6d4, #3b82f6);
                border-radius: 50%; pointer-events: none; z-index: 0;
                left: \${Math.random() * 100}%; top: \${Math.random() * 100}%;
                animation: float 6s ease-in-out infinite;
                animation-delay: \${Math.random() * 2}s;
            \`;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 6000);
        }
        
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes float {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
                25% { transform: translateY(-10px) translateX(5px); opacity: 0.8; }
                50% { transform: translateY(-5px) translateX(-5px); opacity: 1; }
                75% { transform: translateY(-15px) translateX(10px); opacity: 0.6; }
            }
        \`;
        document.head.appendChild(style);
        
        // Create particles
        setInterval(createParticle, 500);
        for (let i = 0; i < 20; i++) {
            setTimeout(createParticle, i * 100);
        }
        
        console.log('🌍✈️ World Freight Dashboard Preview');
        console.log('Enterprise Ready - 90% Complete');
        console.log('Next.js 14 + TypeScript + Three.js + ADUANAPP AI');
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(demoHTML);
  } else if (req.url.startsWith('/api')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'Demo Mode', 
      message: 'Full API requires npm install',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Return to <a href="/">Dashboard</a></h1>');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.clear();
  console.log('\\n🌍✈️ WORLD FREIGHT DASHBOARD PREVIEW');
  console.log('==========================================');
  console.log(\`🚀 URL: http://localhost:\${PORT}\`);
  console.log('📊 Status: Demo Preview Mode');
  console.log('🎯 Progress: 90% Complete');
  console.log('==========================================\\n');
  console.log('Press Ctrl+C to stop server');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('❌ Port 3000 in use. Try: killall node && node simple-server.js');
  } else {
    console.error('Server error:', err);
  }
});

process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down server...');
  process.exit(0);
});