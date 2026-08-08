import { GlassSurface } from '@/components/ui/glass-view';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { createVideoPlayer, type VideoThumbnail } from 'expo-video';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

type VideoPickerProps = {
  videos: string[];
  onChange: (videos: string[]) => void;
  /** Nombre max de vidéos autorisées — plus bas que les photos par défaut,
   * les vidéos étant plus lourdes à uploader et à lire. */
  maxVideos?: number;
};

const TILE_WIDTH = '31%';

function VideoTile({ uri, onRemove }: { uri: string; onRemove: () => void }) {
  const colors = THEME.light;
  const [cover, setCover] = useState<VideoThumbnail | null>(null);

  // Vignette générée localement (aucun appel réseau) : `expo-video` sait
  // extraire une image de la première frame et la rendre directement via
  // `expo-image`, sans dépendance native supplémentaire.
  useEffect(() => {
    let cancelled = false;
    const player = createVideoPlayer(uri);

    player
      .generateThumbnailsAsync(0)
      .then(([thumbnail]) => {
        if (!cancelled) setCover(thumbnail ?? null);
      })
      .catch(() => {
        if (!cancelled) setCover(null);
      })
      .finally(() => player.release());

    return () => {
      cancelled = true;
    };
  }, [uri]);

  return (
    <View
      className="relative mb-[3%] items-center justify-center overflow-hidden rounded-2xl bg-secondary"
      style={{ width: TILE_WIDTH, aspectRatio: 1 }}
    >
      {cover ? (
        <Image source={cover} contentFit="cover" style={{ width: '100%', height: '100%' }} />
      ) : (
        <MaterialCommunityIcons name="movie-outline" size={26} color={colors.mutedForeground} />
      )}

      <GlassSurface intensity="thin" interactive className="absolute right-1 top-1 h-7 w-7 rounded-full">
        <Pressable onPress={onRemove} hitSlop={8} className="h-full w-full items-center justify-center">
          <MaterialCommunityIcons name="close" size={14} color={colors.foreground} />
        </Pressable>
      </GlassSurface>
    </View>
  );
}

export function VideoPicker({ videos, onChange, maxVideos = 3 }: VideoPickerProps) {
  const colors = THEME.light;
  const canAddMore = videos.length < maxVideos;

  const pickVideos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Accès aux vidéos refusé',
        "Autorise l'accès à tes vidéos dans les réglages pour illustrer ton annonce."
      );
      return;
    }

    const remaining = maxVideos - videos.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: remaining > 1,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (!result.canceled) {
      const picked = result.assets.map((asset) => asset.uri);
      onChange([...videos, ...picked].slice(0, maxVideos));
    }
  };

  const removeVideo = (uri: string) => {
    onChange(videos.filter((v) => v !== uri));
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">Vidéos</Text>
        <Text className="text-xs text-muted-foreground">
          {videos.length}/{maxVideos}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-[3%]">
        {videos.map((uri) => (
          <VideoTile key={uri} uri={uri} onRemove={() => removeVideo(uri)} />
        ))}

        {canAddMore && (
          <Pressable
            onPress={pickVideos}
            style={{ width: TILE_WIDTH, aspectRatio: 1 }}
            className="mb-[3%] items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-secondary"
          >
            <MaterialCommunityIcons name="video-plus-outline" size={22} color={colors.mutedForeground} />
            <Text className="text-[11px] font-medium text-muted-foreground">Ajouter</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
