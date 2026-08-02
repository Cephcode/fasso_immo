import { Stack } from 'expo-router';
import '../../global.css';

import { useColorScheme } from 'nativewind';


export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  

  return (

      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

    
  );
}