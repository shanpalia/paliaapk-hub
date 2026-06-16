import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PaliaAPK Hub',
    short_name: 'PaliaAPK',
    description: 'The premium hub for verified Android binaries and apps. Secured by the PaliaAPK Network.',
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#00d2ff',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Trending Apps',
        short_name: 'Trending',
        description: 'View currently popular apps',
        url: '/search',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'App Categories',
        short_name: 'Categories',
        description: 'Explore app categories',
        url: '/categories',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
    screenshots: [
      {
        src: 'https://picsum.photos/seed/pwa-narrow/600/1200',
        sizes: '600x1200',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Home Screen Discovery'
      },
      {
        src: 'https://picsum.photos/seed/pwa-wide/1200/600',
        sizes: '1200x600',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Tablet Hub Overview'
      }
    ]
  };
}
