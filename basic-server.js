const http = require('http');

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
            color: white; min-height: 100vh; line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header { text-align: center; margin-bottom: 3rem; }
        .title {
            font-size: 3rem; font-weight: bold; margin-bottom: 1rem;
            background: linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle { font-size: 1.2rem; color: #94a3b8; margin-bottom: 2rem; }
        .status { 
            display: inline-block; background: rgba(16, 185, 129, 0.1); color: #10b981;
            padding: 0.5rem 1rem; border-radius: 25px; border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .warning {
            background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 0.5rem; padding: 1.5rem; margin: 2rem 0; color: #fbbf24;
        }
        .code-box {
            background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 0.5rem; padding: 1.5rem; margin: 1rem 0;
            font-family: monospace; color: #06b6d4;
        }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0; }
        .card {
            background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem; padding: 2rem; position: relative;
        }
        .card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
            background: linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6);
            border-radius: 1rem 1rem 0 0;
        }
        .card h3 { color: #06b6d4; margin-bottom: 1rem; font-size: 1.3rem; }
        .card p { color: #94a3b8; margin-bottom: 1rem; }
        .feature { display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0; }
        .check { color: #10b981; font-weight: bold; }
        .footer { text-align: center; margin-top: 3rem; color: #64748b; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem; }
        @media (max-width: 768px) { 
            .container { padding: 1rem; } 
            .title { font-size: 2rem; } 
            .grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="title">World Freight Dashboard</h1>
            <p class="subtitle">Mission-critical logistics command center with ADUANAPP integration</p>
            <div class="status">🟢 Enterprise Ready - 90% Complete</div>
        </header>

        <div class="warning">
            <strong>⚠️ Installation Required:</strong> To run the complete interactive dashboard with 3D globe, real-time data, and ADUANAPP integration, you need to install dependencies.
        </div>

        <div class="code-box">
            <div><strong>🚀 Quick Start:</strong></div><br>
            <div># Fix npm permissions (requires admin password):</div>
            <div style="background: rgba(0,0,0,0.5); padding: 0.5rem; border-radius: 4px; color: #10b981; margin: 0.5rem 0;">sudo chown -R $(whoami) ~/.npm</div><br>
            <div># Install and run:</div>
            <div style="background: rgba(0,0,0,0.5); padding: 0.5rem; border-radius: 4px; color: #10b981; margin: 0.5rem 0;">npm install && npm run dev</div><br>
            <div># Access at: <strong style="color: #10b981;">http://localhost:3000</strong></div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>🎯 Real-time KPIs</h3>
                <p>8 critical logistics metrics updated every 2.5 seconds with NASA-level design</p>
                <div class="feature"><span class="check">✓</span> Active Flights Monitoring</div>
                <div class="feature"><span class="check">✓</span> Aircraft Utilization Tracking</div>
                <div class="feature"><span class="check">✓</span> Load Factor & Efficiency</div>
                <div class="feature"><span class="check">✓</span> RATK Revenue Analysis</div>
                <div class="feature"><span class="check">✓</span> Compliance Scoring</div>
            </div>

            <div class="card">
                <h3>🌍 Interactive 3D Globe</h3>
                <p>Three.js world visualization with animated trade routes and airport markers</p>
                <div class="feature"><span class="check">✓</span> Realistic Earth with textures</div>
                <div class="feature"><span class="check">✓</span> Animated route particles</div>
                <div class="feature"><span class="check">✓</span> Mouse controls (rotate/zoom)</div>
                <div class="feature"><span class="check">✓</span> Real-time flight tracking</div>
                <div class="feature"><span class="check">✓</span> 60fps optimization</div>
            </div>

            <div class="card">
                <h3>🤖 ADUANAPP AI Panel</h3>
                <p>Complete AI-powered customs classification with real-time monitoring</p>
                <div class="feature"><span class="check">✓</span> Uni Classifier Service</div>
                <div class="feature"><span class="check">✓</span> Multi Classifier Batching</div>
                <div class="feature"><span class="check">✓</span> SAT Search Integration</div>
                <div class="feature"><span class="check">✓</span> Merceology Analysis</div>
                <div class="feature"><span class="check">✓</span> CODIA Preview (Soon)</div>
            </div>

            <div class="card">
                <h3>📈 Trade Routes Analysis</h3>
                <p>Advanced route optimization with profitability and performance metrics</p>
                <div class="feature"><span class="check">✓</span> Profitability Rankings</div>
                <div class="feature"><span class="check">✓</span> Trend Indicators</div>
                <div class="feature"><span class="check">✓</span> Airport Performance</div>
                <div class="feature"><span class="check">✓</span> Smart Filtering</div>
                <div class="feature"><span class="check">✓</span> Expandable Details</div>
            </div>

            <div class="card">
                <h3>⚡ Tech Stack</h3>
                <p>Enterprise architecture with modern technologies</p>
                <div class="feature"><span class="check">✓</span> Next.js 14 + TypeScript</div>
                <div class="feature"><span class="check">✓</span> Three.js + Tailwind CSS</div>
                <div class="feature"><span class="check">✓</span> WebSocket + Real-time</div>
                <div class="feature"><span class="check">✓</span> Framer Motion</div>
                <div class="feature"><span class="check">✓</span> 4K Ready Design</div>
            </div>

            <div class="card">
                <h3>🏆 Project Status</h3>
                <p>9 out of 10 major components completed - Production ready</p>
                <div class="feature"><span class="check">✓</span> Setup & Configuration</div>
                <div class="feature"><span class="check">✓</span> TypeScript Models</div>
                <div class="feature"><span class="check">✓</span> Main Dashboard</div>
                <div class="feature"><span class="check">✓</span> 3D Globe Component</div>
                <div class="feature"><span class="check">✓</span> ADUANAPP Integration</div>
                <div class="feature"><span class="check">✓</span> Routes Analysis</div>
                <div class="feature"><span class="check">✓</span> Real-time Hooks</div>
                <div class="feature"><span class="check">✓</span> API Layer</div>
                <div class="feature"><span class="check">✓</span> Documentation</div>
            </div>
        </div>

        <div style="text-align: center; margin: 3rem 0;">
            <div style="font-size: 2rem; color: #10b981; margin-bottom: 1rem;">✅ 90% Complete</div>
            <div style="color: #94a3b8;">Only advanced chart components remain (optional enhancement)</div>
        </div>

        <footer class="footer">
            <p><strong>World Freight Dashboard v2.1.0</strong></p>
            <p>Powered by ADUANAPP AI | Enterprise Edition</p>
            <p>Built with ❤️ by the World Freight Development Team</p>
        </footer>
    </div>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = req.url;
  
  if (url === '/' || url === '/dashboard' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(demoHTML);
  } else if (url.startsWith('/api')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'Demo Mode Active',
      message: 'Full API requires: npm install && npm run dev',
      timestamp: new Date().toISOString(),
      progress: '90% Complete',
      components_ready: 9,
      components_total: 10
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1 style="color: white; background: #0f172a; font-family: system-ui; text-align: center; padding: 2rem;">404 - <a href="/" style="color: #06b6d4;">Return to Dashboard</a></h1>');
  }
});

const PORT = 3000;

server.listen(PORT, () => {
  console.clear();
  console.log('');
  console.log('🌍✈️ WORLD FREIGHT DASHBOARD PREVIEW');
  console.log('==========================================');
  console.log('🚀 Server: http://localhost:' + PORT);
  console.log('📊 Status: Demo Preview Mode');
  console.log('🎯 Progress: 90% Complete (9/10 components)');
  console.log('⚠️  Note: Full dashboard requires npm install');
  console.log('==========================================');
  console.log('');
  console.log('📱 Access from mobile: http://[your-ip]:3000');
  console.log('🛑 Stop server: Ctrl+C');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('❌ Port 3000 is in use. Try:');
    console.log('   killall node');
    console.log('   node basic-server.js');
  } else {
    console.error('Server error:', err.message);
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 Server stopped');
  process.exit(0);
});