import { mapRowToListing } from '@/hooks/useListings';
import { supabase } from '@/lib/supabase';
import type { Listing } from '@/types/listing';
import { useEffect, useState } from 'react';

export function useSearchProperty(query: string) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query?.trim();

    if (!trimmedQuery) {
      setListings([]);
      return;
    }

    let isActive = true;
    setLoading(true);

    const filter = `title.ilike.%${trimmedQuery}%,city.ilike.%${trimmedQuery}%,neighborhood.ilike.%${trimmedQuery}%`;

    supabase
      .from('posts')
      .select('id, title, price, city, neighborhood, photos_id, rooms_count, property_type')
      .or(filter)
      .then(({ data, error: fetchError }) => {
        if (!isActive) return;
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setListings((data ?? []).map(mapRowToListing));
        }
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [query]);

  return { listings, loading, error };
}