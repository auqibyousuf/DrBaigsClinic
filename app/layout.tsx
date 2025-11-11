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
    default: "Dr Baig's Clinic - Premium Skin & Hair Care Solutions",
    template: "%s | Dr Baig's Clinic",
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
    'Dr Baig',
    'Dr Baig\'s Clinic',
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
        alt: "Dr Baig's Clinic - Skin & Hair Care",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dr Baig's Clinic - Premium Skin & Hair Care Solutions",
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
  other: {
    'theme-color': '#2563eb',
    'color-scheme': 'light dark',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: "Dr Baig's Clinic",
    description: 'Premium skin and hair care clinic offering expert treatments including hair transplantation, hijama therapy, PRP treatments, acne treatment, and anti-aging solutions.',
    url: 'https://drbaigsclinic.com',
    telephone: '+1-XXX-XXX-XXXX',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    medicalSpecialty: ['Dermatology', 'Trichology', 'Cosmetic Surgery'],
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    sameAs: [
      // Add social media links here when available
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.className} font-sans overflow-x-auto`}>
        <ThemeProvider>
          <ToastProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Skip to main content"
            >
              Skip to main content
            </a>
            <Header />
            <main id="main-content" role="main">{children}</main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
