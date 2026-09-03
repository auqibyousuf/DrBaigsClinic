import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Sora } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThemeProvider from '@/components/ThemeProvider';
import ToastProvider from '@/components/ToastProvider';
import PageTransition from '@/components/PageTransition';
import BookingModalProvider from '@/components/BookingModalProvider';
import SiteReadyGate from '@/components/SiteReadyGate';
import { cn } from '@/lib/utils';
import { getCMSData } from '@/lib/cms';

// Body: Plus Jakarta Sans — clean, confident, modern grotesque.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
});

// Headings/display: Sora — a bold, geometric, distinctly modern sans used
// widely across current premium health-tech and SaaS products. Confident
// without the "wedding invite" risk of a display serif.
const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  weight: ['500', '600', '700', '800'],
});

const staticMetadata: Metadata = {
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
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
  },
  other: {
    'theme-color': '#2563eb',
    'color-scheme': 'light dark',
  },
};

// CMS-controlled favicon (falls back to the header logo, then the static
// default) — this has to be generateMetadata rather than a static export
// since it needs the CMS data, which is only available at request time.
export async function generateMetadata(): Promise<Metadata> {
  let iconUrl = '/icon.svg';
  try {
    const cmsData = await getCMSData();
    iconUrl = cmsData.header?.favicon || cmsData.header?.logo || '/icon.svg';
  } catch {
    // CMS unavailable — fall back to the static default rather than
    // failing the whole page render over a favicon.
  }

  return {
    ...staticMetadata,
    icons: {
      icon: iconUrl,
      apple: iconUrl,
      shortcut: iconUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cmsData = await getCMSData().catch(() => null);
  const contact = cmsData?.footer?.contact;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: "Dr Baig's Clinic",
    description: 'Premium skin and hair care clinic offering expert treatments including hair transplantation, hijama therapy, PRP treatments, acne treatment, and anti-aging solutions.',
    url: 'https://drbaigsclinic.com',
    telephone: contact?.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact?.address || undefined,
      addressCountry: 'IN',
    },
    medicalSpecialty: ['Dermatology', 'Trichology', 'Cosmetic Surgery'],
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    sameAs: (cmsData?.footer?.socialMedia || []).map((s) => s.url).filter(Boolean),
  };

  return (
    <html lang="en" suppressHydrationWarning className={cn(plusJakarta.variable, sora.variable, 'font-sans')}>
      <head>
        {/* Runs before hydration/first paint so the page never renders in
            the wrong theme and then flips — ThemeProvider's own effect runs
            too late (after mount) to prevent that flash, this is what
            actually eliminates it. Mirrors ThemeProvider's own logic
            exactly: 'theme' key, 'light' | 'dark' | 'auto' (default). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||((!t||t==='auto')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${plusJakarta.className} font-sans overflow-x-hidden`}>
        <ThemeProvider>
          <ToastProvider>
            <BookingModalProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Skip to main content"
              >
                Skip to main content
              </a>
              <SiteReadyGate>
                <Header />
                <main id="main-content" role="main">
                  <PageTransition>{children}</PageTransition>
                </main>
                <Footer />
              </SiteReadyGate>
            </BookingModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
