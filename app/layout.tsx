import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThemeProvider from '@/components/ThemeProvider';
import ToastProvider from '@/components/ToastProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: "Dr Baigs's Clinic - Premium Skin & Hair Care Solutions",
    template: "%s | Dr Baigs's Clinic",
  },
  description: 'Expert skin and hair care treatments including hair transplantation, hijama therapy, PRP treatments, acne treatment, anti-aging solutions, and comprehensive beauty services. Transform your skin and hair with our advanced treatments.',
  keywords: [
    'skin care clinic',
    'hair restoration',
    'hair transplantation',
    'hijama therapy',
    'PRP therapy',
    'acne treatment',
    'anti-aging',
    'pigmentation treatment',
    'laser therapy',
    'hair loss treatment',
    'dermatology',
    'trichology',
    'beauty clinic',
    'skincare',
    'haircare',
  ],
  authors: [{ name: "Dr Baig's Clinic" }],
  creator: "Dr Baig's Clinic",
  publisher: "Dr Baig's Clinic",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://drbaigsclinic.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://drbaigsclinic.com',
    siteName: "Dr Baig's Clinic",
    title: "Dr Baig's Clinic - Premium Skin & Hair Care Solutions",
    description: 'Expert skin and hair care treatments including transplantation, hijama therapy, and comprehensive beauty services.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Glow Clinic - Skin & Hair Care',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glow Clinic - Premium Skin & Hair Care Solutions',
    description: 'Expert skin and hair care treatments including transplantation, hijama therapy, and comprehensive beauty services.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
    shortcut: '/icon.svg',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <body className={`${inter.className} font-sans`}>
        <ThemeProvider>
          <ToastProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg">
              Skip to main content
            </a>
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
