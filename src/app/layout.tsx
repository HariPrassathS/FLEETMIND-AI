import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth/auth-context';
import { OfflineBar } from '../components/pwa/offline-bar';
import { InstallPrompt } from '../components/pwa/install-prompt';
import { SwCleanup } from '../components/pwa/sw-cleanup';

export const metadata: Metadata = {
  title: 'FleetMind AI | Optimize Every Load. Every Route. Every Rupee.',
  description:
    'AI-powered fleet decision intelligence platform for load planning, route optimization, cost reduction, and real-time logistics operations.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-background">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v3.29.0/mapbox-gl.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full font-sans antialiased text-slate-900 bg-[#F8FAFC]">
        <AuthProvider>
          <SwCleanup />
          <OfflineBar />
          {children}
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
