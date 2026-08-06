import Header from '@/components/ui/header';
import { GlassSurface } from '@/components/ui/glass-view';
import { isLoggedIn } from '@/lib/isUserloggedIn';
import { supabase } from '@/lib/supabase';
import { THEME } from '@/lib/theme';
import { usePushRegistration } from '@/hooks/usePushRegistration';
import { Octicons } from '@expo/vector-icons';
import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  usePushRegistration(isConnected === true);

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
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Si non connecté (ou utilisateur supprimé dans Supabase), redirection vers Auth
  if (!isConnected) {
    return <Redirect href="/auth/sign-up" />;
  }

  const tabIconColor = (focused: boolean) => (focused ? colors.primary : colors.mutedForegroundSecond);

  return (
    // Pas de GlassBlurRoot ici : la barre d'onglets est injectée par
    // react-navigation via `tabBarBackground`, donc sa GlassSurface finit
    // toujours nichée dans tout ce qui enveloppe <Tabs> — Android interdit
    // ce cas (voir glass-view.tsx). Elle garde donc le voile translucide
    // (sans flou natif) sur Android ; iOS a son vrai verre natif.
    <View style={{ flex: 1 }} className="bg-background">
      {/* Header affiché proprement au-dessus des onglets */}
      <Header />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 64 + insets.bottom,
          },
          tabBarBackground: () => (
            <View
              pointerEvents="none"
              style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom + 8 }}
            >
              <GlassSurface
                intensity="regular"
                className="flex-1 rounded-full"
                style={{
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 6 },
                }}
              />
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="(home)/index"
          options={{
            title: "Découvrir",
            tabBarIcon: ({ focused }) => (
              <Octicons name={focused ? "home-fill" : "home"} size={22} color={tabIconColor(focused)} />
            ),
          }}
        />

        <Tabs.Screen
          name="liked"
          options={{
            title: "Favoris",
            tabBarIcon: ({ focused }) => (
              <Octicons name={focused ? "heart-fill" : "heart"} size={22} color={tabIconColor(focused)} />
            ),
          }}
        />

        <Tabs.Screen
          name="publish"
          options={{
            title: "Publier",
            tabBarIcon: ({ focused }) => (
              <Octicons name={focused ? "feed-plus" : "plus-circle"} size={22} color={tabIconColor(focused)} />
            ),
          }}
        />

        <Tabs.Screen
          name="discussions"
          options={{
            title: "Discussions",
            tabBarIcon: ({ focused }) => (
              <Octicons name={focused ? "comment-discussion" : "comment"} size={22} color={tabIconColor(focused)} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarIcon: ({ focused }) => (
              <Octicons name={focused ? "person-fill" : "person"} size={22} color={tabIconColor(focused)} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}