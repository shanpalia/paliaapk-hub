
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PWAProvider } from './pwa-provider';
import { PWAInstallBanner } from '@/components/pwa-install-banner';

export const metadata: Metadata = {
  title: 'PaliaAPK Hub - Premium Android App Store',
  description: 'Download the latest verified APKs and games securely on PaliaAPK Hub.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PaliaAPK Hub',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#00d2ff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="font-body bg-white pb-20 max-w-screen-md mx-auto min-h-screen border-x border-gray-50 shadow-sm antialiased">
        <FirebaseClientProvider>
          <PWAProvider>
            <TopHeader />
            <main className="px-4 py-4">
              {children}
            </main>
            <BottomNav />
            <PWAInstallBanner />
            <Toaster />
          </PWAProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
