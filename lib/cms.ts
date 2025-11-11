import {
  getCMSDataFromSupabase,
  saveCMSDataToSupabase,
  updateCMSDataInSupabase,
  isSupabaseConfigured,
} from './supabase';

export interface CMSData {
  header: {
    brandName: string;
    logo: string;
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
    }>;
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
    emailSubject?: string;
    emailBody?: string;
    customerEmailSubject?: string;
    customerEmailBody?: string;
  };
}

export async function getCMSData(): Promise<CMSData> {
  // Only use Supabase - no filesystem fallback
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables.');
  }

  const supabaseData = await getCMSDataFromSupabase();
  if (!supabaseData) {
    throw new Error('Failed to fetch CMS data from Supabase. Make sure the cms_data table exists and has data.');
  }

  return supabaseData;
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

  return updatedData;
}
