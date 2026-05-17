import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/lib/toast-context';
import Navbar from '@/components/Navbar/Navbar';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body'
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display'
});

const sanitizeUrl = (raw, fallback) => {
  const trimmed = (raw || '').trim().replace(/^[:\s,;]+/, '').replace(/\/+$/, '');
  try {
    return new URL(trimmed).toString().replace(/\/$/, '');
  } catch {
    return fallback;
  }
};

const SITE_URL = sanitizeUrl(process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000');

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Faisal News — A modern, editorial brief on the day',
    template: '%s · Faisal News'
  },
  description:
    'Faisal News delivers a curated, magazine-grade brief of the day’s top stories, with a personal library to save and annotate the articles that matter.',
  applicationName: 'Faisal News',
  generator: 'Next.js',
  keywords: ['news', 'headlines', 'world news', 'magazine', 'editorial', 'faisal news'],
  authors: [{ name: 'Faisal News' }],
  openGraph: {
    type: 'website',
    siteName: 'Faisal News',
    title: 'Faisal News',
    description: 'A modern, editorial brief on the day.',
    url: SITE_URL
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faisal News',
    description: 'A modern, editorial brief on the day.'
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true }
};

export const viewport = {
  themeColor: '#020B18',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main>{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
