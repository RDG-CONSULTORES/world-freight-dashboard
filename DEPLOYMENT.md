# 🚀 Deployment Guide - World Freight Dashboard

## Quick Deploy to Render

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   # Create GitHub repo first, then:
   git remote add origin https://github.com/YOUR_USERNAME/world-freight-dashboard.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` configuration

### Option 2: Direct Git Deploy

1. **Connect to Render:**
   ```bash
   # From your project directory:
   git remote add render https://git.render.com/srv-YOUR_SERVICE_ID
   git push render main
   ```

### Option 3: Manual Deploy

1. **Create Render Service:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Choose "Deploy from Git repository"
   - Or upload project as ZIP

2. **Configuration:**
   ```
   Name: world-freight-dashboard
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free (for testing)
   ```

## Environment Variables

Add these to your Render service:

```
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-domain.com
NEXT_PUBLIC_ADUANAPP_API_KEY=your-aduanapp-key
```

## Alternative Hosting Options

### Vercel (Easiest for Next.js)
```bash
npm i -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Upload /out folder to Netlify
```

### Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

## 🔥 FASTEST OPTION FOR IMMEDIATE PREVIEW

Since you want to see it RIGHT NOW, use Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy immediately
vercel --prod
```

This will give you a live URL in 2-3 minutes!

## Live Demo URLs

Once deployed, you'll get URLs like:
- **Render**: `https://world-freight-dashboard.onrender.com`
- **Vercel**: `https://world-freight-dashboard.vercel.app`
- **Netlify**: `https://world-freight-dashboard.netlify.app`

## 🎯 Expected Result

Your live dashboard will show:
- 🌍 Interactive 3D globe with trade routes
- 📊 8 real-time KPI metrics
- 🤖 ADUANAPP AI services panel
- 📈 Trade routes analysis
- ⚡ NASA-level visual design
- 📱 Mobile responsive layout

## Troubleshooting

- **Build fails**: Run `npm install` locally first
- **3D globe not loading**: Enable WebGL in browser
- **API errors**: Check environment variables
- **Performance issues**: Use production build only

Ready to deploy! Which option do you prefer?