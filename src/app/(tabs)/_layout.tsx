import Header from '@/components/ui/header';
import { THEME } from '@/lib/theme';
import { Octicons } from '@expo/vector-icons';
import { Redirect, Stack, Tabs } from "expo-router";
import { useColorScheme } from 'nativewind';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';





function AuthGate({ isConnected }: { isConnected: boolean | null }) {
  const { colorScheme } = useColorScheme();
  const colors = colorScheme === 'dark' ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();

  if (isConnected === null) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-foreground">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isConnected) {
    return (
      <Redirect href='/auth/sign-up'/>
    );
  }

  return (
      <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
         <Header />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
  );
}

export default function Layout() {
    const { colorScheme } = useColorScheme();
    const colors = colorScheme === 'dark' ? THEME.dark : THEME.light;

  return (

    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: colors.primaryForegroundSecond,borderTopColor: colors.primaryForeground,elevation: 0.5} }}>
        
    <Tabs.Screen name="(home)/index" 
    options={{title : "Decouvrir",
      tabBarShowLabel: false,
       tabBarIcon: ({ color, focused }) => (
      <Octicons name={focused ? "home-fill" : "home"} size={24} color={ colors.primary} />
          ),
    }}
    
     />

    <Tabs.Screen name="liked" options={{
      tabBarShowLabel: false,
      tabBarIcon: ({ color, focused }) => (
        <Octicons name={focused ? "heart-fill" : "heart"} size={24} color={ colors.primary} />
      ),

    }} />

    <Tabs.Screen name="publish" options={{
      tabBarShowLabel: false,
      tabBarIcon: ({ color, focused }) => (
        <Octicons name={focused ? "feed-plus" : "plus-circle"} size={24} color={ colors.primary} />
      ),

    }} />

    <Tabs.Screen  name="discussions"  options={{ title : "Discussions",
      tabBarShowLabel: false,
      tabBarIcon: ({ color, focused }) => (
        <Octicons name={"comment"} size={24} color={ colors.primary} />
      ),

    }} />

    <Tabs.Screen  name="profile" options={{title : "Profil",tabBarShowLabel: false,
      tabBarIcon: ({ color, focused }) => (
        <Octicons name={focused ? "person-fill" : "person"} size={24} color={ colors.primary} />
      ),

    }} />


    </Tabs>
    
  );
}