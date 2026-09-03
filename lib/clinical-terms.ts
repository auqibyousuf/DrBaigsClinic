import { createClient } from '@supabase/supabase-js';

// Backs the autocomplete on Symptoms/Diagnosis/Examinations/Investigation/
// Advices/Medications — see MEDISRAY_AUDIT.md finding #2. Starts from a
// small curated seed (migration 004) and grows from "Add Custom" entries.

export type ClinicalTermCategory =
  | 'symptom'
  | 'examination'
  | 'diagnosis'
  | 'medication'
  | 'investigation'
  | 'advice';

export interface ClinicalTerm {
  id: string;
  doctor_id: string | null;
  category: ClinicalTermCategory;
  value: string;
  is_preset: boolean;
  use_count: number;
}

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
  }
  return createClient(url, key, {
    global: {
      // Same fix as lib/supabase.ts — without this, Next.js's fetch cache
      // can serve a stale term list, so a custom term just added via
      // "+ Add custom" doesn't show up as a suggestion until the cache
      // happens to expire.
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}

export async function searchClinicalTerms(
  category: ClinicalTermCategory,
  query: string
): Promise<ClinicalTerm[]> {
  const supabase = getClient();
  let builder = supabase
    .from('clinical_terms')
    .select('*')
    .eq('category', category)
    .order('use_count', { ascending: false })
    .order('value', { ascending: true })
    .limit(20);

  if (query.trim()) {
    builder = builder.ilike('value', `%${query.trim()}%`);
  }

  const { data, error } = await builder;
  if (error) {
    throw new Error(`Failed to search clinical terms: ${error.message}`);
  }
  return (data || []) as ClinicalTerm[];
}

// Upserts a custom term the doctor typed and wasn't in the list, bumping its
// use_count on repeat use so frequently-used custom terms rise to the top.
export async function recordClinicalTermUsage(
  category: ClinicalTermCategory,
  value: string
): Promise<void> {
  const supabase = getClient();
  const trimmed = value.trim();
  if (!trimmed) return;

  const { data: existing } = await supabase
    .from('clinical_terms')
    .select('id, use_count')
    .eq('category', category)
    .ilike('value', trimmed)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('clinical_terms')
      .update({ use_count: (existing.use_count || 0) + 1 })
      .eq('id', existing.id);
  } else {
    await supabase.from('clinical_terms').insert({
      category,
      value: trimmed,
      is_preset: false,
      use_count: 1,
    });
  }
}
