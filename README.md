# World Freight Dashboard 🌍✈️

A comprehensive, real-time logistics command center with ADUANAPP AI integration. Built with Next.js 14, TypeScript, and Three.js for enterprise freight operations management.

![Dashboard Preview](https://img.shields.io/badge/Status-Enterprise%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-2.1.0-blue)
![License](https://img.shields.io/badge/License-Enterprise-red)

## 🚀 Features

### Real-time Monitoring
- **Live KPI Dashboard**: 8 critical logistics metrics with real-time updates
- **Interactive 3D Globe**: World map with animated trade routes and airport markers
- **Flight Tracking**: Real-time aircraft positions and cargo data
- **Performance Analytics**: Aircraft utilization, load factors, and efficiency metrics

### ADUANAPP AI Integration
- **Customs Classification**: AI-powered product classification services
- **Multi-service Management**: Uni Classifier, Multi Classifier, SAT Search, Merceology, Product Validator
- **Real-time Metrics**: Processing times, accuracy rates, and cost tracking
- **Service Monitoring**: Status indicators and performance trends
- **CODIA Preview**: Next-generation AI engine coming soon

### Advanced Visualizations
- **NASA-level Design**: Cyber aesthetics with particle effects and animations
- **Responsive Design**: Optimized for 4K displays and mobile devices
- **Interactive Components**: Hover effects, expandable panels, and smooth transitions
- **Dark Theme**: Professional command center appearance

### Data Management
- **WebSocket Support**: Real-time data streaming capabilities
- **Polling Fallback**: Automatic fallback for environments without WebSocket support
- **Caching System**: Intelligent response caching with TTL management
- **Rate Limiting**: Built-in API rate limiting and error handling

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: App Router with React Server Components
- **TypeScript**: Full type safety and IntelliSense support
- **Tailwind CSS**: Utility-first styling with custom theme
- **Framer Motion**: Smooth animations and transitions
- **Three.js**: 3D globe visualization and interactive elements

### State Management
- **Custom Hooks**: useRealTimeData, useWebSocket, useAduanappAPI
- **React State**: Optimized component state management
- **Context API**: Global application state when needed

### Development Tools
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing and optimization

## 📦 Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager
- Modern web browser with WebGL support

### Quick Start

```bash
# Clone the repository
git clone https://github.com/world-freight/dashboard.git
cd world-freight-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# ADUANAPP API Configuration
NEXT_PUBLIC_ADUANAPP_API_URL=https://api.aduanapp.com/v1
NEXT_PUBLIC_ADUANAPP_API_KEY=your_api_key_here

# WebSocket Configuration (optional)
NEXT_PUBLIC_WS_URL=wss://your-websocket-server.com

# Feature Flags
NEXT_PUBLIC_ENABLE_WEBSOCKET=false
NEXT_PUBLIC_ENABLE_3D_GLOBE=true
NEXT_PUBLIC_ENABLE_REAL_TIME=true

# Monitoring (optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## 🎯 Usage

### Dashboard Overview
The main dashboard displays real-time KPIs in an 8-column grid:

- **Active Flights**: Current number of flights in operation
- **Aircraft Utilization**: Average hours per day per aircraft
- **Load Factor**: Percentage of cargo capacity utilized
- **Fuel Efficiency**: Liters consumed per ton-kilometer
- **RATK**: Revenue per Available Ton-Kilometer
- **Hub Turn Time**: Average time aircraft spend at hubs
- **AI Classifications**: Daily ADUANAPP processing volume
- **Compliance Score**: Overall regulatory compliance percentage

### Interactive 3D Globe
- **Mouse Controls**: Click and drag to rotate, scroll to zoom
- **Airport Markers**: Color-coded by airport type (Hub, International, Regional)
- **Trade Routes**: Animated flight paths with real-time cargo flow
- **Live Data**: Real-time flight positions and route performance

### ADUANAPP AI Panel
- **Service Status**: Real-time monitoring of all AI classification services
- **Performance Metrics**: Response times, accuracy rates, and throughput
- **Trend Analysis**: Historical performance and optimization insights
- **Cost Tracking**: Per-operation costs and efficiency metrics

### Trade Routes Analysis
- **Performance Ranking**: Routes sorted by revenue, utilization, or profitability
- **Trend Indicators**: Volume, revenue, and efficiency changes
- **Detailed Metrics**: Expandable cards with airport performance data
- **Filtering Options**: Filter by performance categories and sort preferences

## 🔧 Configuration

### Customizing KPIs
Update the KPI configuration in `src/app/page.tsx`:

```typescript
const kpiCards = [
  {
    title: 'Your Custom KPI',
    value: customValue,
    unit: 'units',
    trend: { direction: 'up', percentage: 5.2 },
    icon: CustomIcon,
    color: 'bg-custom-color'
  }
]
```

### Adding New Services
Extend ADUANAPP services in `src/types/dashboard.ts`:

```typescript
export interface AduanappService {
  id: 'your-new-service' | // existing services...
  // ... rest of interface
}
```

### Customizing Theme
Modify Tailwind configuration in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      freight: {
        // Add your custom colors
        primary: '#your-color',
      }
    }
  }
}
```

## 📊 API Integration

### ADUANAPP Services

The dashboard integrates with five ADUANAPP AI services:

1. **Uni Classifier** - Single product classification
2. **Multi Classifier** - Batch processing classification
3. **SAT Search** - Mexican tax code lookup
4. **Merceology** - Advanced classification analysis
5. **Product Validator** - Description validation service

### WebSocket Events

Real-time updates are supported via WebSocket messages:

```typescript
{
  type: 'kpi_update' | 'flight_update' | 'alert' | 'route_update' | 'aduanapp_update',
  data: any,
  timestamp: string
}
```

### REST API Endpoints

```bash
# KPI Data
GET /api/kpis

# Flight Information
GET /api/flights
GET /api/flights/{id}

# Trade Routes
GET /api/routes
GET /api/routes/{id}/performance

# ADUANAPP Integration
POST /api/aduanapp/classify
POST /api/aduanapp/classify/batch
GET /api/aduanapp/metrics
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Performance Testing

```bash
# Lighthouse CI
npm run lighthouse

# Bundle analysis
npm run analyze

# Load testing
npm run test:load
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Builds

```bash
# Production build
npm run build

# Staging build
npm run build:staging

# Development build with source maps
npm run build:dev
```

## 🔒 Security

### API Security
- Rate limiting with configurable windows
- Request validation and sanitization
- CORS configuration for production environments
- API key management and rotation support

### Data Protection
- No sensitive data stored in localStorage
- Environment variables for all secrets
- CSP headers for XSS protection
- Secure WebSocket connections (WSS)

## 📈 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Intelligent response caching with TTL
- **Lazy Loading**: Components load on demand

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1
- **Lighthouse Score**: > 90

## 🐛 Troubleshooting

### Common Issues

**WebGL not supported**
```bash
# Enable hardware acceleration in browser settings
# Or disable 3D globe with environment variable
NEXT_PUBLIC_ENABLE_3D_GLOBE=false
```

**ADUANAPP API errors**
```bash
# Check API key configuration
# Verify rate limiting settings
# Test connection with curl
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.aduanapp.com/v1/status
```

**Build errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Performance Issues
- Enable caching for repeated API calls
- Reduce update frequency for non-critical data
- Use polling instead of WebSocket in high-latency environments
- Optimize Three.js rendering settings for lower-end devices

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Create a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use conventional commit messages
- Maintain test coverage above 80%
- Document all public APIs
- Follow the existing code style

## 📄 License

This project is licensed under the Enterprise License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- ADUANAPP team for AI classification services
- Three.js community for 3D visualization tools
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first approach
- Framer Motion for smooth animations

## 📞 Support

### Enterprise Support
- Email: support@worldfreight.com
- Phone: +1 (555) 123-4567
- Portal: https://support.worldfreight.com

### Community
- GitHub Issues: Bug reports and feature requests
- Discord: Real-time community support
- Documentation: https://docs.worldfreight.com

---

Built with ❤️ by the World Freight Development Team

![World Freight Logo](https://img.shields.io/badge/World%20Freight-Enterprise%20Dashboard-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIgMTJMMTIgMkwyMiAxMkwxMiAyMkwyIDEyWiIgZmlsbD0iIzMwNjdGRiIvPgo8L3N2Zz4K)