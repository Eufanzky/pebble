import type { Metadata } from 'next';
import { Nunito, Baloo_2, JetBrains_Mono } from 'next/font/google';
import AppShell from '@/components/layout/AppShell';
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

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'pebble — your calm corner for getting things done',
  description:
    'An AI-powered assistant that reduces cognitive overload by transforming information into clear, personalized formats, guided by your companion Pebble.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${baloo.variable} ${jetbrains.variable} dark`}>
      <body className={nunito.className} style={{ background: '#0F0D0A' }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
