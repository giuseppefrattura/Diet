import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Diet & Fridge Smart Manager',
    short_name: 'DietFridge',
    description: 'Gestione intelligente della dispensa, piano alimentare fisso e lista della spesa a fabbisogno FEFO.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#059669',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
