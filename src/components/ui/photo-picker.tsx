import { GlassBlurRoot, GlassSurface } from '@/components/ui/glass-view';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, View } from 'react-native';

type PhotoPickerProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
  /** Nombre max de photos autorisées. Le composant reste générique : il rend
   * autant de vignettes qu'il y a de photos, sans supposer un nombre fixe. */
  maxPhotos?: number;
};

const TILE_WIDTH = '31%';

export function PhotoPicker({ photos, onChange, maxPhotos = 10 }: PhotoPickerProps) {
  const colors = THEME.light;
  const canAddMore = photos.length < maxPhotos;

  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Accès aux photos refusé',
        "Autorise l'accès à tes photos dans les réglages pour illustrer ton annonce."
      );
      return;
    }

    const remaining = maxPhotos - photos.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: remaining > 1,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (!result.canceled) {
      const picked = result.assets.map((asset) => asset.uri);
      onChange([...photos, ...picked].slice(0, maxPhotos));
    }
  };

  const removePhoto = (uri: string) => {
    onChange(photos.filter((p) => p !== uri));
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">Photos</Text>
        <Text className="text-xs text-muted-foreground">
          {photos.length}/{maxPhotos}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-[3%]">
        {photos.map((uri) => (
          <GlassBlurRoot
            key={uri}
            className="relative mb-[3%] overflow-hidden rounded-2xl bg-secondary"
            style={{ width: TILE_WIDTH, aspectRatio: 1 }}
            background={<Image source={{ uri }} contentFit="cover" style={{ width: '100%', height: '100%' }} />}
          >
            <GlassSurface intensity="thin" interactive className="absolute right-1 top-1 h-7 w-7 rounded-full">
              <Pressable
                onPress={() => removePhoto(uri)}
                hitSlop={8}
                className="h-full w-full items-center justify-center"
              >
                <MaterialCommunityIcons name="close" size={14} color={colors.foreground} />
              </Pressable>
            </GlassSurface>
          </GlassBlurRoot>
        ))}

        {canAddMore && (
          <Pressable
            onPress={pickPhotos}
            style={{ width: TILE_WIDTH, aspectRatio: 1 }}
            className="mb-[3%] items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-secondary"
          >
            <MaterialCommunityIcons name="camera-plus-outline" size={22} color={colors.mutedForeground} />
            <Text className="text-[11px] font-medium text-muted-foreground">Ajouter</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
