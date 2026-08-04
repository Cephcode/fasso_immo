import { PropertyList } from '@/components/ui/property-list';
import { useListings } from '@/hooks/useListings';
import { isLoggedIn } from '@/lib/isUserloggedIn';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native'; // Ajout d'un indicateur de chargement

export default function HomeScreen() {
  // null = en cours de vérification, true = connecté, false = déconnecté
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isLoggedIn();
      setIsConnected(loggedIn);
      console.log("Utilisateur connecté ?", loggedIn);
    };

    checkAuth();
  }, []);

  const { listings, loadingMore, refreshing, loadMore, refresh } = useListings();

  // Optionnel : Afficher un écran de chargement pendant la vérification Supabase
  if (isConnected === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 10, gap: 10 }} className='bg-primary-foreground'>
      <PropertyList
        listings={listings}
        loadingMore={loadingMore}
        refreshing={refreshing}
        onEndReached={loadMore}
        onRefresh={refresh}
      />
    </View>
  );
}
