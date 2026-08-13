import { GlassSurface } from '@/components/ui/glass-view';
import { HomeFiltersBar } from '@/components/ui/home-filters-bar';
import { LogoBadge } from '@/components/ui/logo';
import Search from '@/components/ui/search';
import { Text } from '@/components/ui/text';
import { FONT_DISPLAY_BOLD } from '@/lib/fonts';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Redesign v2 : header flottant en verre, propre à l'écran d'accueil (voir
// (tabs)/(home)/index.tsx) — il ne suit plus sur les autres onglets, qui ont
// chacun leur propre titre. La grille défile SOUS ce panneau (voir le
// GlassBlurRoot dans (home)/index.tsx qui le rend possible sur Android).
export default function Header({ onLayout }: { onLayout?: (height: number) => void }) {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();

  return (
    // Vue englobante simple (pas de style propre) : ne sert qu'à mesurer la
    // hauteur totale rendue du panneau flottant, pour que l'écran d'accueil
    // puisse pousser le début de la grille sous le header (voir onLayout).
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.height)}>
      <GlassSurface
        intensity="regular"
        bordered={false}
        className="w-full"
        style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(15,15,18,0.06)' }}
      >
        <View className="w-full gap-3.5 px-5" style={{ paddingTop: insets.top + 10, paddingBottom: 12 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <LogoBadge size={30} />
              <Text style={{ fontFamily: FONT_DISPLAY_BOLD }} className="text-[19px] tracking-tight text-foreground">
                Fasso Immo
              </Text>
            </View>

            <Pressable
              onPress={() => router.push('/(tabs)/profile')}
              hitSlop={8}
              className="h-[34px] w-[34px] items-center justify-center rounded-full bg-secondary"
            >
              <MaterialCommunityIcons name="account-outline" size={19} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Search />
        </View>

        <HomeFiltersBar />
      </GlassSurface>
    </View>
  );
}
