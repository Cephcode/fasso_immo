import { GlassBlurRoot, GlassSurface } from '@/components/ui/glass-view';
import { Text } from '@/components/ui/text';
import { useLikedPosts } from '@/hooks/useLikedPosts';
import { FONT_DISPLAY_BOLD } from '@/lib/fonts';
import { formatPrice } from '@/lib/format';
import { PROPERTY_TYPE_ICONS } from '@/lib/property-type-icons';
import { PROPERTY_TYPE_LABELS } from '@/lib/property-type-labels';
import { toImageUrl, toVideoUrl } from '@/lib/storage';
import { THEME } from '@/lib/theme';
import type { ListingOwner, Post } from '@/types/listing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Carousel, CarouselRef, Pagination } from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MediaItem = { type: 'photo' | 'video'; url: string };

// Une vidéo par slide : lecture pilotée par `active` (slide affiché par le
// carrousel) pour ne jamais avoir plusieurs vidéos qui jouent en même temps.
function VideoSlide({ url, active, width, height }: { url: string; active: boolean; width: number; height: number }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    if (active) player.play();
    else player.pause();
  }, [active, player]);

  return <VideoView player={player} style={{ width, height }} contentFit="cover" nativeControls={active} />;
}

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

  const media: MediaItem[] = [
    ...Object.values(post.photos_urls ?? {})
      .filter(Boolean)
      .map((path): MediaItem => ({ type: 'photo', url: toImageUrl(path) })),
    ...Object.values(post.videos_url ?? {})
      .filter(Boolean)
      .map((path): MediaItem => ({ type: 'video', url: toVideoUrl(path) })),
  ];
  const { isLiked, toggleLike } = useLikedPosts();
  const isFavorite = isLiked(post.id);
  const [activeIndex, setActiveIndex] = useState(0);
  const progress = useSharedValue(0);
  const carouselRef = useRef<CarouselRef>(null);

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(media.length - 1, index));
    carouselRef.current?.scrollTo({ index: clamped, animated: true });
  };

  const chips: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
    { icon: PROPERTY_TYPE_ICONS[post.property_type], label: PROPERTY_TYPE_LABELS[post.property_type] },
    { icon: 'home-outline', label: `${post.rooms_count} pièces` },
    ...(post.bedrooms_number != null ? [{ icon: 'bed-outline' as const, label: `${post.bedrooms_number} ch.` }] : []),
    ...(post.bathrooms_number != null ? [{ icon: 'shower' as const, label: `${post.bathrooms_number} SdB` }] : []),
    ...(post.livingrooms_number != null
      ? [{ icon: 'sofa-outline' as const, label: `${post.livingrooms_number} salon${post.livingrooms_number > 1 ? 's' : ''}` }]
      : []),
    ...(post.garage_cars_number != null && post.garage_cars_number > 0
      ? [{ icon: 'garage-variant' as const, label: `${post.garage_cars_number} garage` }]
      : []),
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
            data={media}
            style={{ width, height: galleryHeight }}
            onSnapToItem={setActiveIndex}
            renderItem={({ item, index }) =>
              item.type === 'video' ? (
                <VideoSlide url={item.url} active={index === activeIndex} width={width} height={galleryHeight} />
              ) : (
                <Image source={{ uri: item.url }} contentFit="cover" style={{ width: '100%', height: '100%' }} />
              )
            }
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

        {media.length > 1 && (
          <View className="absolute bottom-3 left-0 right-0 items-center">
            <GlassSurface intensity="regular" className="flex-row items-center gap-3 rounded-full px-2 py-1.5">
              <Pressable
                onPress={() => goTo(activeIndex - 1)}
                className="h-6 w-6 items-center justify-center rounded-full"
              >
                <MaterialCommunityIcons name="chevron-left" size={14} color={colors.foreground} />
              </Pressable>
              <Pagination
                count={media.length}
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

      {/* Redesign v2 : "sheet peel" — le panneau d'infos chevauche le bas de
          la galerie (marge négative + coins arrondis en haut), comme une
          feuille qui se détache de la photo, au lieu de s'arrêter net dessous. */}
      <View className="gap-6 rounded-t-[26px] bg-background px-4 pt-6" style={{ marginTop: -22 }}>
        {/* Titre + prix */}
        <View className="flex-row items-start justify-between gap-3">
          <Text
            style={{ fontFamily: FONT_DISPLAY_BOLD }}
            className="flex-1 text-[26px] leading-[30px] tracking-tight text-foreground"
          >
            {post.title}
          </Text>
          <View className="items-end">
            {/* text-primary-text : orange plus sombre, requis pour l'AA sur fond blanc — voir theme.ts */}
            <Text className="text-lg font-bold text-primary-text">{formatPrice(post.price)}</Text>
            <Text className="text-xs text-muted-foreground">/ mois</Text>
          </View>
        </View>

        <View className="-mt-4 flex-row items-center gap-1">
          <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.mutedForeground} />
          <Text className="text-sm text-muted-foreground">
            {post.neighborhood}, {post.city}
          </Text>
        </View>

        {/* Caractéristiques : pastilles à largeur automatique — une grille à
            colonnes fixes laisse un blanc dès que le nombre de chips n'est
            pas un multiple de 3 (ex: SdB non renseignée). */}
        <View className="flex-row flex-wrap gap-2">
          {chips.map((chip, index) => (
            <View
              key={index}
              className="flex-row items-center gap-1.5 rounded-2xl bg-secondary px-3.5 py-2.5"
            >
              <MaterialCommunityIcons name={chip.icon} size={18} color={colors.primaryText} />
              <Text className="text-sm font-semibold text-foreground">{chip.label}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View className="gap-2">
          <Text className="text-base font-semibold text-foreground">Description</Text>
          <Text className="text-sm leading-6 text-muted-foreground">{post.description}</Text>
        </View>

        {/* Localisation : lien Maps collé par l'annonceur, absent si non renseigné */}
        {post.location_url && (
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-foreground">Localisation</Text>
              <Pressable onPress={onOpenMaps} hitSlop={8}>
                <Text className="text-sm font-medium text-primary-text">Ouvrir Maps</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={onOpenMaps}
              className="h-40 w-full items-center justify-center gap-2 rounded-2xl bg-secondary"
            >
              <MaterialCommunityIcons name="map-outline" size={24} color={colors.primaryText} />
              <Text className="text-sm font-medium text-muted-foreground">Voir sur Google Maps</Text>
            </Pressable>
          </View>
        )}

        {/* Propriétaire */}
        {owner && (
          <View className="gap-3 rounded-[22px] bg-card p-4 shadow-sm shadow-black/5">
            <Pressable onPress={onViewProfile} className="items-center rounded-full bg-secondary py-3">
              <Text className="text-sm font-semibold text-primary-text">Consulter le profil</Text>
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
