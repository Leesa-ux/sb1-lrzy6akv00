import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ErrorBoundary from '@/components/ui/error-boundary';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'AFROÉ - Rejoignez la révolution digitale africaine',
  description: 'La plateforme révolutionnaire qui connecte l\'Afrique au monde. Soyez parmi les premiers à découvrir l\'avenir du commerce digital africain.',
  keywords: 'AFROÉ, Afrique, commerce digital, plateforme, innovation',
  openGraph: {
    title: 'AFROÉ - Rejoignez la révolution digitale africaine',
    description: 'La plateforme révolutionnaire qui connecte l\'Afrique au monde.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.brevo.com" />
        <link rel="dns-prefetch" href="https://api.twilio.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
