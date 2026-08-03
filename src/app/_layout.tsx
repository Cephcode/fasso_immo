import Header from '@/components/ui/header';
import { NAV_THEME, THEME } from '@/lib/theme';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import { useColorScheme } from 'nativewind';
import '../../global.css';


export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  
    const colors = colorScheme === 'dark' ? THEME.dark : THEME.light;
  return (
    
    <ThemeProvider value={colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light}>
      <Header/>
      <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1} }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
</ThemeProvider>

    
  );
}