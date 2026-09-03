'use client';

import { useEffect, useState } from 'react';

export interface CMSData {
  header?: any;
  hero?: any;
  services?: any;
  about?: any;
  footer?: any;
  contact?: any;
  doctors?: any;
  bookingSettings?: any;
}

// Every consumer used to independently fetch its own section (`/api/cms?
// section=header`, `...=footer`, `...=hero`, ...), firing 5-7 parallel
// requests per page load that each resolved at a different moment — the
// header logo, footer, and hero content would each pop in separately
// instead of the page appearing all at once. Now there's one shared
// in-flight fetch for the full payload; every hook call (whichever section
// it asks for) awaits the same request and reads from the same cache, so
// they all become ready at the same instant.
let cachedData: CMSData | null = null;
let inFlight: Promise<CMSData> | null = null;

function fetchCMSData(): Promise<CMSData> {
  if (cachedData) return Promise.resolve(cachedData);
  if (!inFlight) {
    inFlight = fetch('/api/cms')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch CMS data');
        return res.json();
      })
      .then((result: CMSData) => {
        cachedData = result;
        return result;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

// Lets a top-level loader gate rendering on the exact same fetch/cache the
// hooks below use, instead of guessing when "enough" has loaded.
export function useCMSReady() {
  const [ready, setReady] = useState(cachedData !== null);

  useEffect(() => {
    if (cachedData) {
      setReady(true);
      return;
    }
    let cancelled = false;
    fetchCMSData()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

export function useCMSData(section?: keyof CMSData) {
  const [data, setData] = useState<any>(cachedData ? (section ? cachedData[section] : cachedData) : null);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedData) {
      setData(section ? cachedData[section] : cachedData);
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchCMSData()
      .then((result) => {
        if (cancelled) return;
        setData(section ? result[section] : result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [section]);

  return { data, loading, error };
}
