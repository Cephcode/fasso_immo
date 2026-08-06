import { GlassBlurRoot, GlassSurface } from '@/components/ui/glass-view';
import { Input } from '@/components/ui/input';
import { PhotoPicker } from '@/components/ui/photo-picker';
import { Text } from '@/components/ui/text';
import { useCreatePost } from '@/hooks/useCreatePost';
import { PROPERTY_TYPE_LABELS } from '@/lib/property-type-labels';
import { THEME } from '@/lib/theme';
import type { Post } from '@/types/listing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PropertyType = Post['propertyType'];

const PROPERTY_TYPE_ICONS: Record<PropertyType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  House: 'home-outline',
  Apartment: 'office-building-outline',
  Condo: 'domain',
  Townhouse: 'home-city-outline',
  Land: 'terrain',
};

const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[];

function FieldLabel({ children }: { children: string }) {
  return <Text className="text-sm font-semibold text-foreground">{children}</Text>;
}

export default function PublishScreen() {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();
  const { createPost, submitting } = useCreatePost();

  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');
  const [roomsCount, setRoomsCount] = useState(1);
  const [price, setPrice] = useState('');
  const [country, setCountry] = useState('Burkina Faso');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const isValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    city.trim().length > 0 &&
    neighborhood.trim().length > 0 &&
    Number(price) > 0 &&
    photos.length > 0;

  const resetForm = () => {
    setPhotos([]);
    setTitle('');
    setDescription('');
    setPropertyType('Apartment');
    setRoomsCount(1);
    setPrice('');
    setCity('');
    setNeighborhood('');
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;

    try {
      const id = await createPost({
        title: title.trim(),
        description: description.trim(),
        propertyType,
        roomsCount,
        price: Number(price),
        country: country.trim(),
        city: city.trim(),
        neighborhood: neighborhood.trim(),
        photos,
      });

      resetForm();
      router.push({ pathname: '/property/[id]', params: { id } });
    } catch {
      Alert.alert('Publication impossible', "L'annonce n'a pas pu être publiée. Réessaie dans un instant.");
    }
  };

  // Formulaire défilant complet : c'est le fond flouté par la barre de
  // publication fixée en bas (voir la note sœur/descendante dans
  // glass-view.tsx).
  const formContent = (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          contentContainerStyle={{
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 110,
            gap: 22,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-1">
            <Text className="text-2xl font-bold tracking-tight text-foreground">Publier une annonce</Text>
            <Text className="text-sm text-muted-foreground">
              Ajoute les informations de ton bien pour le mettre en ligne.
            </Text>
          </View>

          <PhotoPicker photos={photos} onChange={setPhotos} maxPhotos={10} />

          <View className="gap-2">
            <FieldLabel>Titre de l&apos;annonce</FieldLabel>
            <Input value={title} onChangeText={setTitle} placeholder="Ex. Appartement lumineux 3 pièces" />
          </View>

          <View className="gap-2">
            <FieldLabel>Description</FieldLabel>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Décris le bien, ses équipements, son environnement..."
              placeholderTextColor={colors.mutedForegroundSecond}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className="min-h-[110px] rounded-2xl border border-transparent bg-secondary px-4 py-3 text-base leading-5 text-foreground"
            />
          </View>

          <View className="gap-2">
            <FieldLabel>Type de bien</FieldLabel>
            <View className="flex-row flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => {
                const active = propertyType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setPropertyType(type)}
                    className={
                      active
                        ? 'flex-row items-center gap-1.5 rounded-full bg-primary px-4 py-2.5'
                        : 'flex-row items-center gap-1.5 rounded-full bg-secondary px-4 py-2.5'
                    }
                  >
                    <MaterialCommunityIcons
                      name={PROPERTY_TYPE_ICONS[type]}
                      size={16}
                      color={active ? colors.primaryForeground : colors.mutedForeground}
                    />
                    <Text
                      className={
                        active ? 'text-sm font-semibold text-primary-foreground' : 'text-sm font-medium text-foreground'
                      }
                    >
                      {PROPERTY_TYPE_LABELS[type]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <FieldLabel>Nombre de pièces</FieldLabel>
            <View className="flex-row items-center gap-4 rounded-full bg-secondary px-2 py-1.5">
              <Pressable
                onPress={() => setRoomsCount((n) => Math.max(1, n - 1))}
                hitSlop={8}
                className="h-8 w-8 items-center justify-center rounded-full bg-background"
              >
                <MaterialCommunityIcons name="minus" size={18} color={colors.foreground} />
              </Pressable>
              <Text className="w-6 text-center text-base font-semibold text-foreground">{roomsCount}</Text>
              <Pressable
                onPress={() => setRoomsCount((n) => Math.min(20, n + 1))}
                hitSlop={8}
                className="h-8 w-8 items-center justify-center rounded-full bg-background"
              >
                <MaterialCommunityIcons name="plus" size={18} color={colors.foreground} />
              </Pressable>
            </View>
          </View>

          <View className="gap-2">
            <FieldLabel>Prix mensuel (FCFA)</FieldLabel>
            <Input value={price} onChangeText={setPrice} placeholder="Ex. 150000" keyboardType="numeric" />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-2">
              <FieldLabel>Ville</FieldLabel>
              <Input value={city} onChangeText={setCity} placeholder="Ouagadougou" />
            </View>
            <View className="flex-1 gap-2">
              <FieldLabel>Quartier</FieldLabel>
              <Input value={neighborhood} onChangeText={setNeighborhood} placeholder="Ouaga 2000" />
            </View>
          </View>

          <View className="gap-2">
            <FieldLabel>Pays</FieldLabel>
            <Input value={country} onChangeText={setCountry} placeholder="Burkina Faso" />
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <GlassBlurRoot className="flex-1 bg-background" background={formContent}>
      <View className="absolute bottom-0 left-0 right-0 px-4" style={{ paddingBottom: insets.bottom + 12 }}>
        <GlassSurface intensity="thick" className="flex-row items-center gap-3 rounded-[26px] p-3">
          <Text className="flex-1 px-1 text-xs text-muted-foreground">
            {photos.length === 0
              ? 'Ajoute au moins une photo pour publier.'
              : `${photos.length} photo${photos.length > 1 ? 's' : ''} sélectionnée${photos.length > 1 ? 's' : ''}`}
          </Text>
          <Pressable
            onPress={handleSubmit}
            disabled={!isValid || submitting}
            className={
              isValid && !submitting
                ? 'flex-row items-center justify-center gap-2 rounded-full bg-primary px-6 py-3'
                : 'flex-row items-center justify-center gap-2 rounded-full bg-primary/40 px-6 py-3'
            }
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text className="font-semibold text-primary-foreground">Publier</Text>
            )}
          </Pressable>
        </GlassSurface>
      </View>
    </GlassBlurRoot>
  );
}
