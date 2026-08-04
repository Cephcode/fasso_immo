import { supabase } from '@/lib/supabase';
import type { Listing, Post } from '@/types/listing';
import { useCallback, useEffect, useState } from 'react';

const PAGE_SIZE = 10;

const PROPERTY_TYPE_LABELS: Record<Post['propertyType'], string> = {
  House: 'Maison',
  Apartment: 'Appartement',
  Condo: 'Condo',
  Townhouse: 'Maison de ville',
  Land: 'Terrain',
};

export function mapRowToListing(row: any): Listing {
  const features: Listing['features'] = [
    { icon: 'bed-outline', label: String(row.rooms_count ?? 0) },
    {
      icon: 'home-outline',
      label: PROPERTY_TYPE_LABELS[row.property_type as Post['propertyType']] ?? row.property_type,
    },
  ];

  return {
    id: row.id,
    title: row.title,
    price: row.price,
    city: row.city,
    neighborhood: row.neighborhood,
    coverPhotoUrl: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${row.photos_id?.['1'] ?? ''}`,
    features,
  };
}

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (pageToLoad: number, replace: boolean) => {
    const from = pageToLoad * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, price, city, neighborhood, photos_id, rooms_count, property_type')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    const mapped = (data ?? []).map(mapRowToListing);
    setHasMore(mapped.length === PAGE_SIZE);
    setListings((prev) => (replace ? mapped : [...prev, ...mapped]));
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(0);
    await fetchPage(0, true);
    setLoading(false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchPage(nextPage, false);
    setPage(nextPage);
    setLoadingMore(false);
  }, [fetchPage, hasMore, loadingMore, page]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    await fetchPage(0, true);
    setRefreshing(false);
  }, [fetchPage]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return { listings, loading, loadingMore, refreshing, error, loadMore, refresh };
}

