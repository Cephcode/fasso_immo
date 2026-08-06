import { mapRowToListing } from '@/hooks/useListings';
import { useLikedPosts } from '@/hooks/useLikedPosts';
import { supabase } from '@/lib/supabase';
import type { Listing } from '@/types/listing';
import { useCallback, useEffect, useState } from 'react';

/** Annonces likées de l'utilisateur connecté, prêtes pour PropertyList. */
export function useLikedListings() {
  const { likedIds, loading: likesLoading } = useLikedPosts();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (likedIds.size === 0) {
      setListings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('id, title, price, city, neighborhood, photos_id, rooms_count, property_type')
      .in('id', Array.from(likedIds))
      .order('created_at', { ascending: false });

    setListings((data ?? []).map(mapRowToListing));
    setLoading(false);
  }, [likedIds]);

  useEffect(() => {
    if (!likesLoading) load();
  }, [likesLoading, load]);

  return { listings, loading: loading || likesLoading, refresh: load };
}
