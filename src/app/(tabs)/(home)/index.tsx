import { GlassBlurRoot } from '@/components/ui/glass-view';
import Header from '@/components/ui/header';
import { PropertyList } from '@/components/ui/property-list';
import { useListingFilters } from '@/hooks/useListingFilters';
import { useListings } from '@/hooks/useListings';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
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

  // Hauteur réelle du header flottant, mesurée au rendu — sert à pousser le
  // début de la grille sous le panneau de verre (voir property-list.tsx).
  const [headerHeight, setHeaderHeight] = useState(0);

  // Redesign v2 : le header (logo + recherche + filtres) flotte en verre
  // au-dessus de la grille, qui défile en dessous — d'où le GlassBlurRoot,
  // qui fournit la cible de flou Android au header (voir glass-view.tsx : la
  // GlassSurface flottante doit toujours être une SŒUR du fond qu'elle
  // floute, jamais une descendante).
  return (
    <GlassBlurRoot
      className="flex-1 bg-background"
      background={
        <View style={{ flex: 1, paddingHorizontal: 10 }} className="bg-background">
          <PropertyList
            listings={listings}
            loadingMore={loadingMore}
            refreshing={refreshing}
            onEndReached={loadMore}
            onRefresh={refresh}
            headerHeight={headerHeight}
          />
        </View>
      }
    >
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <Header onLayout={setHeaderHeight} />
      </View>
    </GlassBlurRoot>
  );
}
