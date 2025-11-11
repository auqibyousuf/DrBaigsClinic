'use client';

import { useEffect, useState } from 'react';

export interface CMSData {
  header?: any;
  hero?: any;
  services?: any;
  about?: any;
  footer?: any;
  contact?: any;
}

export function useCMSData(section?: keyof CMSData) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const url = section
          ? `/api/cms?section=${section}`
          : '/api/cms';

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch CMS data');
        }

        const result = await response.json();
        setData(section ? result[section] : result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching CMS data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [section]);

  return { data, loading, error };
}
