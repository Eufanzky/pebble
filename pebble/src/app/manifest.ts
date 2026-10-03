import type { MetadataRoute } from 'next';

/** Pebble as an installable app (roadmap 5.8). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pebble',
    short_name: 'Pebble',
    description: 'A calm assistant that helps you get things done, one small step at a time.',
    start_url: '/today',
    scope: '/',
    display: 'standalone',
    background_color: '#0F0D0A',
    theme_color: '#0F0D0A',
    icons: [
      { src: '/icons/pebble-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/pebble-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/pebble-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
