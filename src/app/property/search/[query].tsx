import { GlassBlurRoot } from '@/components/ui/glass-view';
import { PropertyList } from '@/components/ui/property-list';
import { SearchResultsHeader } from '@/components/ui/search-results-header';
import { useSearchProperty } from '@/hooks/use-search-property';

import { router, useLocalSearchParams } from 'expo-router';

export default function SearchResultsScreen() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const { listings, loading } = useSearchProperty(query);

  return (
    <GlassBlurRoot className="flex-1 bg-background">
      <SearchResultsHeader
        query={query}
        resultCount={listings.length}
        loading={loading}
        onBack={() => router.back()}
        onSubmitQuery={(newQuery) =>
          router.setParams({ query: newQuery })
        }
      />

      <PropertyList
        listings={listings}
        loadingMore={false}
        refreshing={loading}
        onEndReached={() => {}}
        onRefresh={() => {}}
      />
    </GlassBlurRoot>
  );
}
