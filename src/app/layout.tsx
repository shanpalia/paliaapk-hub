import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BottomNavigation } from "@/components/BottomNavigation";

export const metadata: Metadata = {
  title: 'PLKAPK Hub | The Ultimate Android App Marketplace',
  description: 'Discover and download verified Android APKs for your device.',
  appleWebApp: {
    title: 'PLKAPK Hub',
    statusBarStyle: 'default',
    capable: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen selection:bg-primary/20 selection:text-primary pb-safe lg:pb-0 bg-background overflow-x-hidden">
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            {children}
          </div>
        </div>
        <BottomNavigation />
        <Toaster />
      </body>
    </html>
  );
}
