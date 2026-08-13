import { Text } from '@/components/ui/text';
import { useLikedPosts } from '@/hooks/useLikedPosts';
import { THEME } from '@/lib/theme';
import type { Listing } from '@/types/listing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

function formatPrice(amount: number) {
  const withDots = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return withDots;
}

type LikedRowProps = {
  listing: Listing;
  onPress: (listing: Listing) => void;
};

/** Ligne de l'onglet Favoris (doc v2 : liste, pas la grille de PropertyCard)
 * — vignette + infos + cœur toujours plein, puisque toute annonce listée ici
 * est par définition likée. Réutilise `useLikedPosts` déjà consommé par
 * PropertyCard, aucune nouvelle logique de like. */
export function LikedRow({ listing, onPress }: LikedRowProps) {
  const colors = THEME.light;
  const { toggleLike } = useLikedPosts();

  const specs = [
    listing.bedrooms != null && `${listing.bedrooms} ch.`,
    listing.bathrooms != null && `${listing.bathrooms} sdb`,
  ].filter(Boolean) as string[];

  return (
    <Pressable onPress={() => onPress(listing)} className="flex-row items-center gap-3.5 active:opacity-70">
      <Image
        source={{ uri: listing.coverPhotoUrl }}
        contentFit="cover"
        style={{ width: 96, height: 96, borderRadius: 16 }}
      />

      <View className="flex-1 gap-1.5">
        <Text numberOfLines={1} className="text-base font-semibold text-foreground">
          {listing.title}
        </Text>
        <Text numberOfLines={1} className="text-sm text-muted-foreground">
          {listing.neighborhood}, {listing.city}
        </Text>
        <Text className="text-base font-bold text-foreground">
          {formatPrice(listing.price)} <Text className="text-[11px] font-medium text-muted-foreground">FCFA</Text>
        </Text>
        {specs.length > 0 && (
          <Text numberOfLines={1} className="text-xs font-medium" style={{ color: '#3A3A42' }}>
            {specs.join(' · ')}
          </Text>
        )}
      </View>

      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          toggleLike(listing.id);
        }}
        hitSlop={8}
        className="h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-tint"
      >
        <MaterialCommunityIcons name="heart" size={18} color={colors.primary} />
      </Pressable>
    </Pressable>
  );
}
