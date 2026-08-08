import type { Post } from '@/types/listing';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type PriceSort = 'asc' | 'desc' | null;

export type ListingFilters = {
  city: string | null;
  neighborhood: string | null;
  propertyType: Post['property_type'] | null;
  priceSort: PriceSort;
  priceMin: number | null;
  priceMax: number | null;
  bedroomsMin: number | null;
  bathroomsMin: number | null;
  livingroomsMin: number | null;
  garageCarsMin: number | null;
  roomsMin: number | null;
};

export const DEFAULT_LISTING_FILTERS: ListingFilters = {
  city: null,
  neighborhood: null,
  propertyType: null,
  priceSort: null,
  priceMin: null,
  priceMax: null,
  bedroomsMin: null,
  bathroomsMin: null,
  livingroomsMin: null,
  garageCarsMin: null,
  roomsMin: null,
};

// Le tri par prix n'est pas un "filtre" qui exclut des annonces : on ne le
// compte pas dans le badge "Plus de filtres (N)".
const COUNTED_KEYS = [
  'city',
  'neighborhood',
  'propertyType',
  'priceMin',
  'priceMax',
  'bedroomsMin',
  'bathroomsMin',
  'livingroomsMin',
  'garageCarsMin',
  'roomsMin',
] as const satisfies readonly (keyof ListingFilters)[];

type ListingFiltersContextValue = {
  filters: ListingFilters;
  updateFilters: (patch: Partial<ListingFilters>) => void;
  resetFilters: () => void;
  activeCount: number;
};

const ListingFiltersContext = createContext<ListingFiltersContextValue | null>(null);

/** Source de vérité unique des filtres de la page d'accueil, partagée entre
 * la barre de filtres rapides et l'écran "Plus de filtres". */
export function ListingFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<ListingFilters>(DEFAULT_LISTING_FILTERS);

  const updateFilters = useCallback((patch: Partial<ListingFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_LISTING_FILTERS), []);

  const activeCount = useMemo(
    () => COUNTED_KEYS.filter((key) => filters[key] !== null).length,
    [filters]
  );

  const value = useMemo(
    () => ({ filters, updateFilters, resetFilters, activeCount }),
    [filters, updateFilters, resetFilters, activeCount]
  );

  return <ListingFiltersContext.Provider value={value}>{children}</ListingFiltersContext.Provider>;
}

export function useListingFilters() {
  const ctx = useContext(ListingFiltersContext);
  if (!ctx) throw new Error('useListingFilters doit être utilisé sous ListingFiltersProvider.');
  return ctx;
}
