import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import '../../global.css';

import { NAV_THEME, THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';


export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  
    const colors = colorScheme === 'dark' ? THEME.dark : THEME.light;
  return (
    
    <ThemeProvider value={colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light}>
      
      <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
</ThemeProvider>

    
  );
}