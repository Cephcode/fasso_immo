import '../../global.css';
import { Stack,ThemeProvider} from 'expo-router';

import { PortalHost } from '@rn-primitives/portal';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme'; // adjust path to wherever you saved theme.ts

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <Stack />
      <PortalHost />
    </ThemeProvider>
  );
}