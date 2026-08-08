import { GlassSurface } from '@/components/ui/glass-view';
import Header from '@/components/ui/header';
import { useAuth } from '@/hooks/useAuth';
import { usePushRegistration } from '@/hooks/usePushRegistration';
import { THEME } from '@/lib/theme';
import { Octicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();

  // L'app est désormais accessible sans compte : les annonces (onglet
  // "Découvrir") s'affichent dès l'ouverture. Seul l'onglet "Publier" exige
  // une connexion — voir le blocage de navigation ci-dessous et la garde
  // au niveau de l'écran lui-même (publish/index.tsx) pour les accès directs.
  const { isLoggedIn } = useAuth();
  usePushRegistration(isLoggedIn === true);

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
          // BottomTabItem.js (vendor react-navigation) donne à la cellule de
          // chaque onglet `justifyContent: 'flex-start'` (pensé pour un icône
          // au-dessus d'un label) : sans label affiché, l'icône reste collée
          // en haut de sa cellule de 64px au lieu de s'y recentrer. On force
          // l'icône à occuper toute la cellule pour qu'elle se recentre
          // elle-même (styles.icon du même fichier a déjà justifyContent/
          // alignItems: 'center' sur 100% de son wrapper).
          tabBarIconStyle: { height: '100%', width: '100%' },
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 64 + insets.bottom,
          },
          // Le conteneur de la tab bar réserve `insets.bottom` en paddingBottom
          // (voir BottomTabBar.js) pour la rangée d'icônes, mais ce
          // `tabBarBackground` est positionné en absolute et ignore ce padding
          // (il se cale sur la boîte totale, pas sur la boîte déjà réduite) :
          // il faut donc soustraire `insets.bottom` nous-mêmes pour que le
          // pilule de verre garde le même centre vertical que les icônes.
          tabBarBackground: () => (
            <View
              pointerEvents="none"
              style={{ flex: 1, paddingHorizontal: 8, paddingTop: 8, paddingBottom: insets.bottom + 8 }}
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
          listeners={{
            tabPress: (e) => {
              // Onglet réservé aux utilisateurs connectés : tant que l'état
              // de connexion n'est pas encore confirmé (isLoggedIn === null),
              // on laisse passer — l'écran publish/index.tsx refait la
              // vérification et affiche sa propre garde en cas de besoin.
              if (isLoggedIn === false) {
                e.preventDefault();
                router.push({ pathname: '/auth/login', params: { redirect: '/(tabs)/publish' } });
              }
            },
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
          listeners={{
            tabPress: (e) => {
              // Même garde que l'onglet Publier : le profil affiche des
              // informations personnelles, donc réservé aux connectés.
              if (isLoggedIn === false) {
                e.preventDefault();
                router.push({ pathname: '/auth/login', params: { redirect: '/(tabs)/profile' } });
              }
            },
          }}
        />
      </Tabs>
    </View>
  );
}