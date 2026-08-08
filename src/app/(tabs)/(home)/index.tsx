import { HomeFiltersBar } from '@/components/ui/home-filters-bar';
import { PropertyList } from '@/components/ui/property-list';
import { useListingFilters } from '@/hooks/useListingFilters';
import { useListings } from '@/hooks/useListings';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { View } from 'react-native';

// Page d'accueil de l'app : les annonces sont publiques, donc affichées
// immédiatement à l'ouverture, sans attendre une vérification de session.
// L'authentification n'est requise que pour publier (voir (tabs)/publish).
export default function HomeScreen() {
  const { filters } = useListingFilters();
  const { listings, loadingMore, refreshing, loadMore, refresh } = useListings(filters);

  // Le chargement initial est déjà fait par useListings au montage — on ne
  // rafraîchit ici qu'aux retours sur l'onglet suivants (ex: après avoir
  // édité une annonce depuis le profil), pour ne pas doubler la requête.
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refresh();
    }, [refresh])
  );

  return (
    <View style={{ flex: 1 }} className="bg-background">
      <HomeFiltersBar />
      <View style={{ flex: 1, paddingHorizontal: 10, gap: 10 }} className="bg-background">
        <PropertyList
          listings={listings}
          loadingMore={loadingMore}
          refreshing={refreshing}
          onEndReached={loadMore}
          onRefresh={refresh}
        />
      </View>
    </View>
  );
}
