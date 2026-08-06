import { GlassSurface } from '@/components/ui/glass-view';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import type { Listing } from '@/types/listing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

function formatPrice(amount: number) {
  const withDots = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots} FCFA`;
}

type PropertyCardProps = {
  listing: Listing;
  onPress?: (listing: Listing) => void;
  style?: StyleProp<ViewStyle>;
};

export function PropertyCard({ listing, onPress, style }: PropertyCardProps) {
  const colors = THEME.light;
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Pressable
      onPress={() => onPress?.(listing)}
      style={style}
      className="overflow-hidden rounded-[22px] bg-card shadow-sm shadow-black/10"
    >
      <View className="relative aspect-[4/3] w-full">
        <Image
          source={{ uri: listing.coverPhotoUrl }}
          contentFit="cover"
          transition={150}
          style={{ width: '100%', height: '100%' }}
        />

        <GlassSurface intensity="thin" interactive className="absolute right-2 top-2 h-9 w-9 rounded-full">
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setIsFavorite((prev) => !prev);
            }}
            hitSlop={8}
            className="h-full w-full items-center justify-center"
          >
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={16}
              color={isFavorite ? colors.primary : colors.foreground}
            />
          </Pressable>
        </GlassSurface>

        <GlassSurface intensity="thin" className="absolute bottom-2 left-2 rounded-full">
          <Text className="px-3 py-1.5 text-xs font-bold text-foreground">
            {formatPrice(listing.price)}
          </Text>
        </GlassSurface>
      </View>

      <View className="gap-1 p-3">
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="text-base font-semibold text-card-foreground"
        >
          {listing.title}
        </Text>

        <View className="flex-row items-center gap-1">
          <MaterialCommunityIcons name="map-marker-outline" size={12} color={colors.mutedForeground} />
          <Text numberOfLines={1} ellipsizeMode="tail" className="flex-1 text-sm text-muted-foreground">
            {listing.city}, {listing.neighborhood}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}