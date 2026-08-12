import { LikedPostsProvider } from '@/hooks/useLikedPosts';
import { ListingFiltersProvider } from '@/hooks/useListingFilters';
import { emitNewMessage } from '@/lib/messageEvents';
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

  useEffect(() => {
    // Relaie l'arrivée d'une notif de nouveau message aux écrans de
    // discussion montés (voir lib/messageEvents.ts), pour une sensation de
    // temps réel sans abonnement Supabase Realtime.
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const discussionId = notification.request.content.data?.discussionId;
      if (typeof discussionId === 'string') {
        emitNewMessage(discussionId);
      }
    });
    return () => subscription.remove();
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