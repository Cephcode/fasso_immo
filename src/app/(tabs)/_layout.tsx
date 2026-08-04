import Header from '@/components/ui/header';
import { isLoggedIn } from '@/lib/isUserloggedIn';
import { supabase } from '@/lib/supabase';
import { THEME } from '@/lib/theme';
import { Octicons } from '@expo/vector-icons';
import { Redirect, Tabs } from "expo-router";
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const colors = colorScheme === 'dark' ? THEME.dark : THEME.light;

  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Vérification initiale auprès de Supabase
    isLoggedIn().then((loggedIn) => {
      if (isMounted) setIsConnected(loggedIn);
    });

    // 2. Écouteur en temps réel pour capturer la déconnexion/suppression
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (isMounted) setIsConnected(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (isMounted) setIsConnected(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Écran de chargement pendant la vérification
  if (isConnected === null) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-foreground">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Si non connecté (ou utilisateur supprimé dans Supabase), redirection vers Auth
  if (!isConnected) {
    return <Redirect href="/auth/sign-up" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header affiché proprement au-dessus des onglets */}
      <Header />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.primaryForegroundSecond,
            borderTopColor: colors.primaryForeground,
            elevation: 0.5,
          },
        }}
      >
        <Tabs.Screen
          name="(home)/index"
          options={{
            title: "Découvrir",
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <Octicons name={focused ? "home-fill" : "home"} size={24} color={colors.primary} />
            ),
          }}
        />

        <Tabs.Screen
          name="liked"
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <Octicons name={focused ? "heart-fill" : "heart"} size={24} color={colors.primary} />
            ),
          }}
        />

        <Tabs.Screen
          name="publish"
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <Octicons name={focused ? "feed-plus" : "plus-circle"} size={24} color={colors.primary} />
            ),
          }}
        />

        <Tabs.Screen
          name="discussions"
          options={{
            title: "Discussions",
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <Octicons name="comment" size={24} color={colors.primary} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <Octicons name={focused ? "person-fill" : "person"} size={24} color={colors.primary} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}