import { createClient } from '@supabase/supabase-js';
import type { CMSData } from './cms';

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

// Get CMS data from Supabase
export async function getCMSDataFromSupabase(): Promise<CMSData | null> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables.');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Failed to initialize Supabase client');
  }

  const { data, error } = await supabase
    .from('cms_data')
    .select('data')
    .eq('id', 'main')
    .single();

  if (error) {
    console.error('Error fetching from Supabase:', error);
    throw new Error(`Failed to fetch CMS data from Supabase: ${error.message}`);
  }

  if (!data || !data.data) {
    throw new Error('No CMS data found in Supabase. Please run the import SQL query to initialize the database.');
  }

  return data.data as CMSData;
}

// Save CMS data to Supabase
export async function saveCMSDataToSupabase(data: CMSData): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables.');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Failed to initialize Supabase client');
  }

  const { error } = await supabase
    .from('cms_data')
    .upsert({
      id: 'main',
      data: data,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

  if (error) {
    console.error('Error saving to Supabase:', error);
    throw new Error(`Failed to save CMS data to Supabase: ${error.message}`);
  }

  return true;
}

// Update a specific section in Supabase
export async function updateCMSDataInSupabase(
  section: keyof CMSData,
  sectionData: Partial<CMSData[keyof CMSData]>
): Promise<CMSData> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables.');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Failed to initialize Supabase client');
  }

  // Get current data
  const currentData = await getCMSDataFromSupabase();
  if (!currentData) {
    throw new Error('Could not fetch current CMS data from Supabase');
  }

  // Update the section
  const updatedData: CMSData = {
    ...currentData,
    [section]: {
      ...currentData[section],
      ...sectionData,
    } as CMSData[keyof CMSData],
  };

  // Save updated data
  await saveCMSDataToSupabase(updatedData);

  return updatedData;
}
