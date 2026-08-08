import { LikedPostsProvider } from '@/hooks/useLikedPosts';
import { ListingFiltersProvider } from '@/hooks/useListingFilters';
import { NAV_THEME } from '@/lib/theme';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import * as Notifications from 'expo-notifications';
import { colorScheme as nativewindColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';

// Affiche la notification même si l'app est au premier plan (par ex. un
// nouveau message pendant qu'on utilise l'app).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    // Le design du client impose un fond blanc constant : on verrouille le
    // thème clair quel que soit le réglage système de l'appareil.
    // Doit s'exécuter après le montage (et non au niveau module) car sur web
    // ce fichier est d'abord évalué côté serveur, où `window` n'existe pas.
    nativewindColorScheme.set('light');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={NAV_THEME.light}>
          <LikedPostsProvider>
            <ListingFiltersProvider>
              <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </ListingFiltersProvider>
          </LikedPostsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}