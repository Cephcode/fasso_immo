import type { ListingFilters } from '@/hooks/useListingFilters';
import { toImageUrl } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { Listing } from '@/types/listing';
import { useCallback, useEffect, useState } from 'react';

const PAGE_SIZE = 10;

export function mapRowToListing(row: any): Listing {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    city: row.city,
    neighborhood: row.neighborhood,
    coverPhotoUrl: toImageUrl(row.photos_urls?.['1'] ?? ''),
    // Redesign v2 : pastilles chambres/salles de bain sur la carte — voir
    // property-card.tsx. `null` (pas 0) quand l'annonce ne renseigne pas le
    // champ, pour ne pas afficher "0 ch." sur un terrain par exemple.
    bedrooms: row.bedrooms_number ?? null,
    bathrooms: row.bathrooms_number ?? null,
  };
}

export function useListings(filters: ListingFilters) {
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

    let query = supabase
      .from('posts')
      .select(
        'id, title, price, city, neighborhood, photos_urls, rooms_count, property_type, bedrooms_number, bathrooms_number, livingrooms_number, garage_cars_number'
      );

    if (filters.city) query = query.eq('city', filters.city);
    if (filters.neighborhood) query = query.eq('neighborhood', filters.neighborhood);
    if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
    if (filters.priceMin != null) query = query.gte('price', filters.priceMin);
    if (filters.priceMax != null) query = query.lte('price', filters.priceMax);
    if (filters.roomsMin != null) query = query.gte('rooms_count', filters.roomsMin);
    if (filters.bedroomsMin != null) query = query.gte('bedrooms_number', filters.bedroomsMin);
    if (filters.bathroomsMin != null) query = query.gte('bathrooms_number', filters.bathroomsMin);
    if (filters.livingroomsMin != null) query = query.gte('livingrooms_number', filters.livingroomsMin);
    if (filters.garageCarsMin != null) query = query.gte('garage_cars_number', filters.garageCarsMin);

    query =
      filters.priceSort != null
        ? query.order('price', { ascending: filters.priceSort === 'asc' })
        : query.order('created_at', { ascending: false });

    const { data, error: fetchError } = await query.range(from, to);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    const mapped = (data ?? []).map(mapRowToListing);
    setHasMore(mapped.length === PAGE_SIZE);
    setListings((prev) => (replace ? mapped : [...prev, ...mapped]));
  }, [filters]);

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

