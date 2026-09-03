import {
  getCMSDataFromSupabase,
  getCMSSectionFromSupabase,
  saveCMSDataToSupabase,
  updateCMSDataInSupabase,
  isSupabaseConfigured,
} from './supabase';
import { defaultServices } from './default-services';

export interface CMSData {
  header: {
    brandName: string;
    logo: string;
    // Browser-tab icon — separate from the header logo since the logo is
    // often a wide wordmark/lockup while a favicon needs to read at ~16px
    // square. Falls back to `logo` when unset.
    favicon?: string;
    navItems: Array<{
      id: string;
      label: string;
      href: string;
      icon: string;
    }>;
    ctaButton: {
      text: string;
      href: string;
    };
  };
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
    backgroundImage: string;
  };
  services: {
    title: string;
    subtitle: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      image: string;
      features: string[];
      duration?: string;
      price?: string;
      overview?: string;
      heroImage?: string;
      steps?: Array<{ title: string; description: string }>;
      faqs?: Array<{ question: string; answer: string }>;
    }>;
  };
  doctors?: {
    items: Array<{
      id: string;
      name: string;
      specialty: string;
      qualification?: string;
      photo?: string;
      phone: string;
      email: string;
      bio?: string;
      isActive: boolean;
    }>;
  };
  bookingSettings?: {
    closedDates: string[];
    closedWeekdays: number[];
    // Daily appointment time slots (24h "HH:00" strings). Falls back to
    // DEFAULT_SLOTS in lib/appointments.ts when unset/empty.
    slots?: string[];
  };
  about: {
    title: string;
    subtitle: string;
    features: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
    }>;
  };
  footer: {
    brandName: string;
    logo: string;
    description: string;
    services: Array<{
      name: string;
      href: string;
    }>;
    quickLinks: Array<{
      name: string;
      href: string;
    }>;
    contact: {
      address: string;
      phone: string;
      email: string;
    };
    socialMedia: Array<{
      id: string;
      name: string;
      url: string;
      icon?: string;
    }>;
    copyright: string;
    legalLinks: Array<{
      name: string;
      href: string;
    }>;
  };
  contact: {
    title: string;
    subtitle: string;
    email: string;
    notificationPhone?: string;
    emailSubject?: string;
    emailBody?: string;
    customerEmailSubject?: string;
    customerEmailBody?: string;
    // SMS/WhatsApp send through the same Twilio channel (lib/notifications.ts
    // sends WhatsApp first, falling back to SMS) — one template covers both.
    patientSmsTemplate?: string;
    adminSmsTemplate?: string;
  };
}

// Real seed content — not just an empty shape — so the site looks fully
// populated (and is actually usable) whenever Supabase can't be reached,
// instead of showing blank sections. This is the same copy that used to be
// hardcoded piecemeal across components; centralizing it here means every
// consumer sees consistent content, and once real CMS data exists in
// Supabase it takes over automatically (this is only ever the fallback).
function getDefaultCMSData(): CMSData {
  return {
    header: {
      brandName: "Dr Baig's Clinic",
      logo: '/icon.svg',
      navItems: [
        { id: 'home', label: 'Home', href: '/', icon: 'home' },
        { id: 'services', label: 'Services', href: '/#services', icon: 'services' },
        { id: 'about', label: 'About', href: '/#about', icon: 'about' },
        { id: 'contact', label: 'Contact', href: '/#contact', icon: 'contact' },
      ],
      ctaButton: { text: 'Book Appointment', href: '/#contact' },
    },
    hero: {
      title: 'Transform Your Skin & Hair',
      subtitle: "Experience world-class treatments at Dr Baig's Clinic. Your journey to confidence starts here.",
      ctaText: 'Book Consultation',
      ctaHref: '#contact',
      // No stock-photo placeholder — an unset background just shows the
      // brand gradient (see Hero.tsx) until the clinic uploads a real one.
      backgroundImage: '',
    },
    services: {
      title: 'Our Services',
      subtitle: 'Comprehensive skin and hair care solutions tailored to your needs',
      items: defaultServices.map((s) => ({ ...s, features: [] as string[] })),
    },
    doctors: { items: [] },
    bookingSettings: { closedDates: [], closedWeekdays: [], slots: [] },
    about: {
      title: "Why Choose Baig's Clinic?",
      subtitle: 'Excellence in every treatment',
      features: [
        {
          id: 'expert-team',
          title: 'Expert Team',
          description: 'Board-certified specialists with years of experience in dermatology and trichology.',
          icon: 'shield',
        },
        {
          id: 'advanced-tech',
          title: 'Advanced Technology',
          description: 'Latest medical-grade equipment and innovative treatment protocols for best results.',
          icon: 'lightning',
        },
        {
          id: 'personalized-care',
          title: 'Personalized Care',
          description: 'Customized treatment plans designed specifically for your unique needs and goals.',
          icon: 'heart',
        },
      ],
    },
    footer: {
      brandName: "Dr Baig's Clinic",
      logo: '/icon.svg',
      description:
        'Your trusted partner for comprehensive skin and hair care solutions. Experience excellence in every treatment.',
      services: [],
      quickLinks: [
        { name: 'About Us', href: '/#about' },
        { name: 'Services', href: '/#services' },
        { name: 'Contact', href: '/#contact' },
      ],
      contact: {
        address: '123 Health Street\nCity, State 12345',
        phone: '+1 (234) 567-890',
        email: 'info@drbaigsclinic.com',
      },
      socialMedia: [],
      copyright: "Dr Baig's Clinic",
      legalLinks: [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
      ],
    },
    contact: {
      title: 'Book Your Appointment',
      subtitle: 'Start your journey to healthier skin and hair today',
      email: 'appointments@drbaigsclinic.com',
    },
  };
}

// Logging this on every failed request (each page load fires ~7 parallel CMS
// fetches) would flood the console with the same root cause repeated 7x.
// Throttle it to once every 30s per server process instead.
let lastUnavailableWarningAt = 0;
function warnCMSUnavailableOnce(detail: string) {
  const now = Date.now();
  if (now - lastUnavailableWarningAt > 30_000) {
    lastUnavailableWarningAt = now;
    console.warn(
      `[CMS] Supabase is unreachable (${detail}). Serving fallback content so the site keeps working — ` +
        `check SUPABASE_URL/SUPABASE_ANON_KEY and network access if this persists.`
    );
  }
}

// The whole CMS record is one JSON blob (including every base64-embedded
// image — hero background, logo, service/doctor photos), so every call here
// re-downloads that entire payload from Supabase even when only a small
// section (e.g. `doctors`) is actually needed — that round-trip is what made
// things like the booking modal's doctor dropdown feel slow. A short-lived
// in-memory cache means the handful of near-simultaneous CMS fetches a page
// load fires (~7) — or a user reopening the booking modal repeatedly — share
// one fetch instead of each re-pulling the full blob. Cleared instantly by
// admin saves below, so edits still show up right away.
let cachedData: CMSData | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 15_000;
let inFlightFetch: Promise<CMSData | null> | null = null;

function setCache(data: CMSData) {
  cachedData = data;
  cachedAt = Date.now();
}

export async function getCMSData(): Promise<CMSData> {
  if (!isSupabaseConfigured()) {
    warnCMSUnavailableOnce('SUPABASE_URL/SUPABASE_ANON_KEY not set');
    return getDefaultCMSData();
  }

  if (cachedData && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    // Coalesce concurrent cache-miss callers (e.g. a page's ~7 parallel CMS
    // fetches on first load) into a single Supabase round-trip.
    if (!inFlightFetch) {
      inFlightFetch = getCMSDataFromSupabase().finally(() => {
        inFlightFetch = null;
      });
    }
    const supabaseData = await inFlightFetch;
    if (!supabaseData) {
      warnCMSUnavailableOnce('no data returned');
      return cachedData || getDefaultCMSData();
    }
    setCache(supabaseData);
    return supabaseData;
  } catch (error) {
    warnCMSUnavailableOnce(error instanceof Error ? error.message : 'unknown error');
    return cachedData || getDefaultCMSData();
  }
}

// For a single-section request (e.g. the booking modal's doctor dropdown,
// or `/api/cms?section=X`): serve straight from the warm in-memory cache
// when we have one (no network call at all), otherwise pull just that one
// JSON path from Supabase instead of the entire blob — the whole point
// being to never download every section's base64 images just to answer
// "what are the doctors?".
export async function getCMSSection<K extends keyof CMSData>(section: K): Promise<CMSData[K]> {
  if (!isSupabaseConfigured()) {
    warnCMSUnavailableOnce('SUPABASE_URL/SUPABASE_ANON_KEY not set');
    return getDefaultCMSData()[section];
  }

  if (cachedData && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedData[section];
  }

  try {
    const sectionData = await getCMSSectionFromSupabase(section);
    if (sectionData == null) {
      warnCMSUnavailableOnce('no data returned');
      return cachedData?.[section] ?? getDefaultCMSData()[section];
    }
    return sectionData;
  } catch (error) {
    warnCMSUnavailableOnce(error instanceof Error ? error.message : 'unknown error');
    return cachedData?.[section] ?? getDefaultCMSData()[section];
  }
}

// Synchronous version removed - all operations must use async Supabase

export async function saveCMSData(data: CMSData): Promise<void> {
  // Only use Supabase - no filesystem fallback
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables.');
  }

  const success = await saveCMSDataToSupabase(data);
  if (!success) {
    throw new Error('Failed to save CMS data to Supabase');
  }
  setCache(data);
}

export async function updateCMSData(section: keyof CMSData, data: any): Promise<CMSData> {
  // Only use Supabase - no filesystem fallback
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables.');
  }

  const updatedData = await updateCMSDataInSupabase(section, data);
  if (!updatedData) {
    throw new Error('Failed to update CMS data in Supabase');
  }

  setCache(updatedData);
  return updatedData;
}
