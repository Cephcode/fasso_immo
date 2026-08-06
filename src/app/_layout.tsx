import { isLoggedIn } from '@/lib/isUserloggedIn';
import { NAV_THEME } from '@/lib/theme';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import { colorScheme as nativewindColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';

// Le design du client impose un fond blanc constant : on verrouille le thème
// clair quel que soit le réglage système de l'appareil.
nativewindColorScheme.set('light');

export default function RootLayout() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let isActive = true;
    isLoggedIn().then((loggedIn) => {
      if (isActive) setIsConnected(loggedIn);
    });
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={NAV_THEME.light}>
              
      <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}