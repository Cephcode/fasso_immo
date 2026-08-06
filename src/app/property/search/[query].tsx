import { PropertyList } from '@/components/ui/property-list';
import { SearchResultsHeader } from '@/components/ui/search-results-header';
import { useSearchProperty } from '@/hooks/use-search-property';

import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function SearchResultsScreen() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const { listings, loading } = useSearchProperty(query);

  return (
    // Le header ne flotte pas au-dessus de la liste (il la pousse vers le
    // bas), donc pas besoin de cible de flou Android ici.
    <View className="flex-1 bg-background">
      <SearchResultsHeader
        query={query}
        resultCount={listings.length}
        loading={loading}
        onBack={() => router.back()}
        onSubmitQuery={(newQuery) => router.setParams({ query: newQuery })}
      />

      <PropertyList
        listings={listings}
        loadingMore={false}
        refreshing={loading}
        onEndReached={() => {}}
        onRefresh={() => {}}
      />
    </View>
  );
}
