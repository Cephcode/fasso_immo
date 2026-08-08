import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

/** Valeurs de ville/quartier réellement utilisées par les annonces
 * existantes — sert à peupler les sélecteurs de filtres (évite les fautes
 * de frappe et les filtres qui ne renvoient jamais rien). */
export function useLocationOptions() {
  const [cities, setCities] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    supabase
      .from('posts')
      .select('city, neighborhood')
      .then(({ data }) => {
        if (!isMounted || !data) return;

        const citySet = new Set<string>();
        const neighborhoodSet = new Set<string>();
        for (const row of data) {
          if (row.city) citySet.add(row.city);
          if (row.neighborhood) neighborhoodSet.add(row.neighborhood);
        }
        setCities([...citySet].sort((a, b) => a.localeCompare(b)));
        setNeighborhoods([...neighborhoodSet].sort((a, b) => a.localeCompare(b)));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { cities, neighborhoods };
}
