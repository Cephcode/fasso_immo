import { Stack, ThemeProvider } from 'expo-router';
import '../../global.css';

import { NAV_THEME } from '@/lib/theme'; // adjust path to wherever you saved theme.ts
import { PortalHost } from '@rn-primitives/portal';
import { useColorScheme } from 'nativewind';


export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  

  return (

    <ThemeProvider value={NAV_THEME[colorScheme === 'dark' ? 'dark' : 'light']}>
      <Stack />
      <PortalHost />
    </ThemeProvider>
    
  );
}