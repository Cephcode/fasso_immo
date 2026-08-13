import { BrandedSplashScreen } from '@/components/ui/splash-screen';
import { LikedPostsProvider } from '@/hooks/useLikedPosts';
import { ListingFiltersProvider } from '@/hooks/useListingFilters';
import { emitNewMessage } from '@/lib/messageEvents';
import { NAV_THEME } from '@/lib/theme';
import { InstrumentSans_700Bold, useFonts } from '@expo-google-fonts/instrument-sans';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { colorScheme as nativewindColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';

// Durée d'affichage du splash JS (badge + mot-marque + accroche) une fois la
// police prête, avant de révéler l'app — le splash natif ne peut afficher
// qu'une image statique, sans texte, donc ce relais est nécessaire pour
// montrer la marque complète au démarrage.
const BRANDED_SPLASH_DURATION_MS = 700;

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

// Redesign v2 : le mot-marque et les titres d'écran utilisent Instrument
// Sans 700 (voir le design system). On garde le splash affiché tant que la
// police n'est pas chargée, pour éviter un flash de police système.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ InstrumentSans_700Bold });
  const [showBrandedSplash, setShowBrandedSplash] = useState(true);

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

  useEffect(() => {
    if (!fontsLoaded) return;
    // Bascule du splash natif (image statique, icône seule) vers le splash
    // JS (badge + mot-marque + accroche, voir splash-screen.tsx) dès que
    // possible, puis le laisse affiché un court instant avant de révéler
    // l'app.
    SplashScreen.hideAsync();
    const timer = setTimeout(() => setShowBrandedSplash(false), BRANDED_SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  // Tant que la police n'est pas prête, le splash natif recouvre encore tout
  // l'écran (hideAsync n'a pas encore été appelé) : ce `null` n'est donc
  // jamais visible, il évite juste un flash de contenu non stylé en dessous.
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={NAV_THEME.light}>
          {showBrandedSplash ? (
            <BrandedSplashScreen />
          ) : (
            <LikedPostsProvider>
              <ListingFiltersProvider>
                <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
              </ListingFiltersProvider>
            </LikedPostsProvider>
          )}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}