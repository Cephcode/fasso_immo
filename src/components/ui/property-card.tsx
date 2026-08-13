import { GlassBlurRoot, GlassSurface } from '@/components/ui/glass-view';
import { Text } from '@/components/ui/text';
import { useLikedPosts } from '@/hooks/useLikedPosts';
import { THEME } from '@/lib/theme';
import type { Listing } from '@/types/listing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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

// Ombre teintée chaud (jamais noir pur) portée directement par la photo :
// pas de conteneur blanc autour, la carte "flotte" sur le fond de la page.
const CARD_SHADOW = {
  shadowColor: '#100C08',
  shadowOpacity: 0.1,
  shadowRadius: 11,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};

export function PropertyCard({ listing, onPress, style }: PropertyCardProps) {
  const colors = THEME.light;
  const { isLiked, toggleLike } = useLikedPosts();
  const liked = isLiked(listing.id);

  const hasBed = listing.bedrooms != null;
  const hasBath = listing.bathrooms != null;
  const hasSpecs = hasBed || hasBath;

  return (
    // L'ombre est posée ici, sur une vue SANS `overflow-hidden` — RN
    // clippe l'ombre portée si elle est sur la même vue que le clip du
    // visuel. Le Pressable ci-dessous garde `overflow-hidden` pour les
    // coins arrondis de la photo, sans jamais toucher au style d'ombre.
    <View className="rounded-[22px]" style={[CARD_SHADOW, style]}>
      {/* `active:opacity-80` : léger retour tactile à l'appui — sans lui,
          toucher une carte ne donne aucun signal visuel avant la navigation,
          ce qui fait "inerte" plutôt que réactif. */}
      <Pressable onPress={() => onPress?.(listing)} className="overflow-hidden rounded-[22px] active:opacity-80">
        <GlassBlurRoot
          className="relative aspect-[3/4] w-full"
          background={
            <Image
              source={{ uri: listing.coverPhotoUrl }}
              contentFit="cover"
              transition={150}
              style={{ width: '100%', height: '100%' }}
            />
          }
        >
          <GlassSurface intensity="thin" interactive className="absolute right-2 top-2 h-8 w-8 rounded-full">
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                toggleLike(listing.id);
              }}
              hitSlop={8}
              className="h-full w-full items-center justify-center"
            >
              <MaterialCommunityIcons
                name={liked ? 'heart' : 'heart-outline'}
                size={16}
                color={liked ? colors.primary : colors.foreground}
              />
            </Pressable>
          </GlassSurface>

          {/* Panneau de verre encastré : titre, quartier, prix, et
              chambres/salles de bain en repli texte — toutes les infos de
              la carte vivent désormais sur la photo. */}
          <GlassSurface
            intensity="regular"
            bordered={false}
            className="absolute bottom-1.5 left-1.5 right-1.5 items-stretch rounded-[17px]"
            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' }}
          >
            <View className="gap-0.5 px-2 py-2">
              <Text numberOfLines={1} ellipsizeMode="tail" className="text-[13px] font-bold tracking-tight text-foreground">
                {listing.title}
              </Text>
              <Text numberOfLines={1} ellipsizeMode="tail" className="text-[11px]" style={{ color: '#4A4A54' }}>
                {listing.neighborhood}, {listing.city}
              </Text>

              {/* Le prix occupe toute la largeur du panneau, sur sa propre
                  ligne — des pastilles chambres/salles de bain à côté du prix
                  le poussaient hors du panneau (ou le tronquaient sur les
                  prix longs). Chambres/salles de bain passent donc en texte
                  compact sous le prix, comme le prévoit déjà le repli du
                  design pour les cartes étroites — on l'utilise ici tout le
                  temps plutôt que juste en dessous d'un seuil de largeur. */}
              <Text numberOfLines={1} className="mt-0.5 text-[13px] font-bold text-foreground">
                {formatPrice(listing.price)}
              </Text>

              {hasSpecs && (
                <Text numberOfLines={1} className="text-[11px]" style={{ color: '#4A4A54' }}>
                  {[hasBed && `${listing.bedrooms} ch.`, hasBath && `${listing.bathrooms} sdb`].filter(Boolean).join(' · ')}
                </Text>
              )}
            </View>
          </GlassSurface>
        </GlassBlurRoot>
      </Pressable>
    </View>
  );
}
