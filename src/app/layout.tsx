import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'World Freight Dashboard | ADUANAPP Integration',
  description: 'Mission-critical logistics command center with real-time freight tracking, AI-powered customs classification, and advanced analytics.',
  keywords: 'freight, logistics, dashboard, ADUANAPP, customs, AI, real-time tracking, trade routes, cargo management',
  authors: [{ name: 'World Freight Company' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0f172a',
  robots: 'noindex, nofollow', // For internal use
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${inter.className} bg-dashboard-dark text-white antialiased overflow-x-hidden`}>
        <div id="root" className="min-h-screen">
          {children}
        </div>
        <div id="portal-root" />
      </body>
    </html>
  )
}