import type { Metadata, Viewport } from 'next';
import { Nunito, Baloo_2 } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-nunito',
  display: 'swap',
});

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-baloo',
  display: 'swap',
});


export const metadata: Metadata = {
  title: 'pebble — your calm corner for getting things done',
  description:
    'An AI-powered assistant that reduces cognitive overload by transforming information into clear, personalized formats, guided by your companion Pebble.',
  // The browser icon is app/icon.svg (linked by Next.js); this adds the home-screen one
  icons: {
    apple: '/icons/pebble-180.png',
  },
  appleWebApp: { capable: true, title: 'Pebble', statusBarStyle: 'black-translucent' },
};

// Reach the edges of phones with a notch; shell.css keeps clear of them with safe-area insets.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0F0D0A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${baloo.variable} dark`}>
      <body className={nunito.className} style={{ background: '#0F0D0A' }}>
        {children}
      </body>
    </html>
  );
}
