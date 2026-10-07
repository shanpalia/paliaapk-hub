import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PaliaAPK Hub', short_name: 'PaliaAPK Hub', description: 'Download verified Android apps and games from PaliaAPK Hub.', start_url: '/', id: '/', scope: '/', display: 'standalone', orientation: 'portrait', background_color: '#ffffff', theme_color: '#ffffff',
    icons: [{src: '/paliaapk-hub-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any'}],
    shortcuts: [
      {name: 'Search Apps', short_name: 'Search', url: '/search', icons: [{src: '/paliaapk-hub-icon.svg', sizes: 'any'}]},
      {name: 'Settings', short_name: 'Settings', url: '/settings', icons: [{src: '/paliaapk-hub-icon.svg', sizes: 'any'}]}
    ]
  };
}
