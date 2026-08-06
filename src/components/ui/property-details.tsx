import { GlassBlurRoot, GlassSurface } from '@/components/ui/glass-view';
import { Text } from '@/components/ui/text';
import { useLikedPosts } from '@/hooks/useLikedPosts';
import { formatPrice } from '@/lib/format';
import { PROPERTY_TYPE_LABELS } from '@/lib/property-type-labels';
import { THEME } from '@/lib/theme';
import type { ListingOwner, Post } from '@/types/listing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Carousel, CarouselRef, Pagination } from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PropertyDetailProps = {
  post: Post;
  owner?: ListingOwner;
  onBack?: () => void;
  onShare?: () => void;
  onOpenMaps?: () => void;
  onContactPress?: () => void;
  onInterestedPress?: () => void;
  onViewProfile?: () => void;
};

export function PropertyDetail({
  post,
  owner,
  onBack,
  onShare,
  onOpenMaps,
  onContactPress,
  onInterestedPress,
  onViewProfile,
}: PropertyDetailProps) {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const photos = Object.values(post.photos_id).filter(Boolean);
  const photos_url=photos.map((item,id)=>{
    return process.env.EXPO_PUBLIC_IMAGE_BASE_URL+item
  })
  const { isLiked, toggleLike } = useLikedPosts();
  const isFavorite = isLiked(post.id);
  const [activeIndex, setActiveIndex] = useState(0);
  const progress = useSharedValue(0);
  const carouselRef = useRef<CarouselRef>(null);

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(photos.length - 1, index));
    carouselRef.current?.scrollTo({ index: clamped, animated: true });
  };

  const chips: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
    { icon: 'bed-outline', label: `${post.rooms_count} Ch` },
    { icon: 'home-outline', label: PROPERTY_TYPE_LABELS[post.propertyType] },
  ];

  const galleryHeight = width * 0.9;

  // Écran défilant complet (galerie + infos) : c'est le fond flouté par la
  // barre d'action fixée en bas. Voir la note dans glass-view.tsx — la
  // `GlassSurface` de cette barre doit rester une sœur de ce contenu, jamais
  // une descendante, sinon Android casse le flou.
  const screenContent = (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
      {/* Galerie photo : même règle sœur/descendante, à son échelle à elle. */}
      <GlassBlurRoot
        className="relative"
        style={{ width, height: galleryHeight }}
        background={
          <Carousel
            ref={carouselRef}
            progress={progress}
            data={photos_url}
            style={{ width, height: galleryHeight }}
            onSnapToItem={setActiveIndex}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} contentFit="cover" style={{ width: '100%', height: '100%' }} />
            )}
          />
        }
      >
        <View
          className="absolute left-0 right-0 flex-row items-center justify-between px-4"
          style={{ top: insets.top + 8 }}
        >
          <GlassSurface intensity="regular" interactive className="h-10 w-10 rounded-full">
            <Pressable onPress={onBack} hitSlop={8} className="h-full w-full items-center justify-center">
              <MaterialCommunityIcons name="chevron-left" size={24} color={colors.foreground} />
            </Pressable>
          </GlassSurface>

          <View className="flex-row gap-2">
            <GlassSurface intensity="regular" interactive className="h-10 w-10 rounded-full">
              <Pressable onPress={onShare} hitSlop={8} className="h-full w-full items-center justify-center">
                <MaterialCommunityIcons name="share-variant" size={16} color={colors.foreground} />
              </Pressable>
            </GlassSurface>
            <GlassSurface intensity="regular" interactive className="h-10 w-10 rounded-full">
              <Pressable
                onPress={() => toggleLike(post.id)}
                hitSlop={8}
                className="h-full w-full items-center justify-center"
              >
                <MaterialCommunityIcons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isFavorite ? colors.primary : colors.foreground}
                />
              </Pressable>
            </GlassSurface>
          </View>
        </View>

        {photos.length > 1 && (
          <View className="absolute bottom-3 left-0 right-0 items-center">
            <GlassSurface intensity="regular" className="flex-row items-center gap-3 rounded-full px-2 py-1.5">
              <Pressable
                onPress={() => goTo(activeIndex - 1)}
                className="h-6 w-6 items-center justify-center rounded-full"
              >
                <MaterialCommunityIcons name="chevron-left" size={14} color={colors.foreground} />
              </Pressable>
              <Pagination
                count={photos.length}
                progress={progress}
                dotStyle={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.mutedForegroundSecond }}
                activeDotStyle={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary }}
                containerStyle={{ gap: 6 }}
                onPress={goTo}
              />
              <Pressable
                onPress={() => goTo(activeIndex + 1)}
                className="h-6 w-6 items-center justify-center rounded-full"
              >
                <MaterialCommunityIcons name="chevron-right" size={14} color={colors.foreground} />
              </Pressable>
            </GlassSurface>
          </View>
        )}
      </GlassBlurRoot>

      <View className="gap-6 px-4 pt-5">
        {/* Titre + prix */}
        <View className="flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-2xl font-bold tracking-tight text-foreground">{post.title}</Text>
          <View className="items-end">
            <Text className="text-lg font-bold text-primary">{formatPrice(post.price)}</Text>
            <Text className="text-xs text-muted-foreground">/ mois</Text>
          </View>
        </View>

        <View className="-mt-4 flex-row items-center gap-1">
          <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.mutedForeground} />
          <Text className="text-sm text-muted-foreground">
            {post.neighborhood}, {post.city}
          </Text>
        </View>

        {/* Caractéristiques */}
        <View className="flex-row gap-3">
          {chips.map((chip, index) => (
            <View key={index} className="flex-1 items-center gap-1 rounded-2xl bg-secondary py-3">
              <MaterialCommunityIcons name={chip.icon} size={20} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground">{chip.label}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View className="gap-2">
          <Text className="text-base font-semibold text-foreground">Description</Text>
          <Text className="text-sm leading-6 text-muted-foreground">{post.description}</Text>
        </View>

        {/* Localisation (placeholder pour l'instant) */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">Localisation</Text>
            <Pressable onPress={onOpenMaps} hitSlop={8}>
              <Text className="text-sm font-medium text-primary">Ouvrir Maps</Text>
            </Pressable>
          </View>
          <View className="h-40 w-full items-center justify-center rounded-2xl bg-secondary">
            <MaterialCommunityIcons name="map-outline" size={24} color={colors.primary} />
          </View>
        </View>

        {/* Propriétaire */}
        {owner && (
          <View className="gap-3 rounded-[22px] bg-card p-4 shadow-sm shadow-black/5">
            <Pressable onPress={onViewProfile} className="items-center rounded-full bg-secondary py-3">
              <Text className="text-sm font-semibold text-primary">Consulter le profil</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <GlassBlurRoot className="flex-1 bg-background" background={screenContent}>
      {/* Barre d'action flottante */}
      <View className="absolute bottom-0 left-0 right-0 px-4" style={{ paddingBottom: insets.bottom + 12 }}>
        <GlassSurface intensity="thick" className="flex-row gap-3 rounded-[26px] p-3">
          <Pressable
            onPress={onContactPress}
            className="flex-row items-center justify-center gap-2 rounded-full border border-border/70 bg-background/60 px-5 py-3"
          >
            <MaterialCommunityIcons name="message-outline" size={18} color={colors.foreground} />
            <Text className="font-semibold text-foreground">Message</Text>
          </Pressable>
          <Pressable
            onPress={onInterestedPress}
            className="flex-1 items-center justify-center rounded-full bg-primary py-3"
          >
            <Text className="font-semibold text-primary-foreground">Je suis intéressé</Text>
          </Pressable>
        </GlassSurface>
      </View>
    </GlassBlurRoot>
  );
}
