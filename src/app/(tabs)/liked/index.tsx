import { LikedRow } from '@/components/ui/liked-row';
import { Text } from '@/components/ui/text';
import { useLikedListings } from '@/hooks/useLikedListings';
import { FONT_DISPLAY_BOLD } from '@/lib/fonts';
import { THEME } from '@/lib/theme';
import type { Listing } from '@/types/listing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LikedScreen() {
  const { listings, loading, refresh } = useLikedListings();
  const insets = useSafeAreaInsets();

  const openListing = (listing: Listing) => {
    router.push({ pathname: '/property/[id]', params: { id: listing.id } });
  };

  return (
    <View className="flex-1 bg-background">
      {/* Redesign v2 : titre d'écran permanent (plus seulement dans l'état
          vide) — même onglet ne portant plus le header global, voir _layout.tsx. */}
      <View className="px-5" style={{ paddingTop: insets.top + 14, paddingBottom: 10 }}>
        <Text style={{ fontFamily: FONT_DISPLAY_BOLD }} className="text-[28px] tracking-tight text-foreground">
          Favoris
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={THEME.light.primary} />
        </View>
      ) : (
        <FlashList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-5 py-3">
              <LikedRow listing={item} onPress={openListing} />
            </View>
          )}
          refreshing={loading}
          onRefresh={refresh}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          ListEmptyComponent={
            <View className="items-center gap-2.5 px-8 pt-20">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-tint">
                <MaterialCommunityIcons name="heart-outline" size={26} color={THEME.light.tintForeground} />
              </View>
              <Text className="text-[17px] font-semibold text-foreground">Aucun favori</Text>
              <Text className="max-w-[220px] text-center text-sm text-muted-foreground">
                Touche le cœur sur une annonce pour la retrouver ici.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
