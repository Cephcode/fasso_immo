import { GlassBlurRoot, GlassSurface } from '@/components/ui/glass-view';
import { Input } from '@/components/ui/input';
import { LocationPicker } from '@/components/ui/location-picker';
import { NumberStepper } from '@/components/ui/number-stepper';
import { PhotoPicker } from '@/components/ui/photo-picker';
import { SignInRequired } from '@/components/ui/sign-in-required';
import { Text } from '@/components/ui/text';
import { VideoPicker } from '@/components/ui/video-picker';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePost } from '@/hooks/useCreatePost';
import { FONT_DISPLAY_BOLD } from '@/lib/fonts';
import { PROPERTY_TYPE_ICONS } from '@/lib/property-type-icons';
import { PROPERTY_TYPE_LABELS } from '@/lib/property-type-labels';
import { toImageUrl, toVideoUrl } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { THEME } from '@/lib/theme';
import type { Post } from '@/types/listing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
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

type PropertyType = Post['property_type'];

const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[];

function FieldLabel({ children }: { children: string }) {
  return <Text className="text-sm font-semibold text-foreground">{children}</Text>;
}

export default function PublishScreen() {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();
  const { createPost, updatePost, submitting } = useCreatePost();
  const { isLoggedIn } = useAuth();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = Boolean(editId);

  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');
  const [roomsCount, setRoomsCount] = useState(1);
  const [bedroomsCount, setBedroomsCount] = useState(1);
  const [bathroomsCount, setBathroomsCount] = useState(1);
  const [livingroomsCount, setLivingroomsCount] = useState(1);
  const [garageCarsCount, setGarageCarsCount] = useState(0);
  const [price, setPrice] = useState('');
  const [country, setCountry] = useState('Burkina Faso');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [loadingPost, setLoadingPost] = useState(isEditing);

  // Mode édition : précharge l'annonce existante et pré-remplit le
  // formulaire. Les médias existants sont représentés par leur URL publique
  // (voir useCreatePost.buildPayload, qui ne les ré-uploade pas).
  useEffect(() => {
    if (!editId) return;

    let isMounted = true;
    setLoadingPost(true);

    supabase
      .from('posts')
      .select('*')
      .eq('id', editId)
      .single()
      .then(({ data, error }) => {
        if (isMounted && !error && data) {
          const post = data as Post;
          setTitle(post.title);
          setDescription(post.description);
          setPropertyType(post.property_type);
          setRoomsCount(post.rooms_count);
          setBedroomsCount(post.bedrooms_number ?? 1);
          setBathroomsCount(post.bathrooms_number ?? 1);
          setLivingroomsCount(post.livingrooms_number ?? 1);
          setGarageCarsCount(post.garage_cars_number ?? 0);
          setPrice(String(post.price));
          setCountry(post.country);
          setCity(post.city);
          setNeighborhood(post.neighborhood);
          setPhotos(Object.values(post.photos_urls ?? {}).filter(Boolean).map(toImageUrl));
          setVideos(Object.values(post.videos_url ?? {}).filter(Boolean).map(toVideoUrl));
          setLocationUrl(post.location_url ?? '');
        }
        if (isMounted) setLoadingPost(false);
      });

    return () => {
      isMounted = false;
    };
  }, [editId]);

  // Garde d'authentification : `null` pendant la vérification (on affiche un
  // simple loader pour éviter un flash du formulaire), `false` -> écran de
  // connexion, `true` -> formulaire de publication.
  if (isLoggedIn === null || loadingPost) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoggedIn === false) {
    return (
      <SignInRequired
        redirect="/(tabs)/publish"
        message="Connecte-toi ou crée un compte pour publier une annonce."
      />
    );
  }

  const missingFields = [
    photos.length === 0 && 'une photo',
    title.trim().length === 0 && 'un titre',
    description.trim().length === 0 && 'une description',
    city.trim().length === 0 && 'une ville',
    neighborhood.trim().length === 0 && 'un quartier',
    !(Number(price) > 0) && 'un prix',
  ].filter((v): v is string => Boolean(v));

  const isValid = missingFields.length === 0;

  const resetForm = () => {
    setPhotos([]);
    setVideos([]);
    setTitle('');
    setDescription('');
    setPropertyType('Apartment');
    setRoomsCount(1);
    setBedroomsCount(1);
    setBathroomsCount(1);
    setLivingroomsCount(1);
    setGarageCarsCount(0);
    setPrice('');
    setCity('');
    setNeighborhood('');
    setLocationUrl('');
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;

    const input = {
      title: title.trim(),
      description: description.trim(),
      propertyType,
      roomsCount,
      bedroomsCount,
      bathroomsCount,
      livingroomsCount,
      garageCarsCount,
      price: Number(price),
      country: country.trim(),
      city: city.trim(),
      neighborhood: neighborhood.trim(),
      photos,
      videos,
      locationUrl,
    };

    try {
      if (isEditing && editId) {
        await updatePost(editId, input);
        router.back();
        return;
      }

      const id = await createPost(input);
      resetForm();
      router.push({ pathname: '/property/[id]', params: { id } });
    } catch (err) {
      console.error('[publish] échec de la sauvegarde', err);
      const detail = err instanceof Error ? err.message : String(err);
      Alert.alert(
        isEditing ? 'Mise à jour impossible' : 'Publication impossible',
        `L'annonce n'a pas pu être enregistrée. ${detail}`
      );
    }
  };

  // Formulaire défilant complet : c'est le fond flouté par la barre de
  // publication fixée en bas (voir la note sœur/descendante dans
  // glass-view.tsx).
  const formContent = (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          contentContainerStyle={{
            // Redesign v2 : plus de header global (voir (tabs)/_layout.tsx)
            // — insets.top requis ici, sinon le titre démarre sous l'encoche.
            paddingTop: insets.top + 16,
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 110,
            gap: 22,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-1">
            <Text style={{ fontFamily: FONT_DISPLAY_BOLD }} className="text-[28px] tracking-tight text-foreground">
              {isEditing ? "Modifier l'annonce" : 'Publier une annonce'}
            </Text>
            <Text className="text-sm text-muted-foreground">
              Ajoute les informations de ton bien pour le mettre en ligne.
            </Text>
          </View>

          <PhotoPicker photos={photos} onChange={setPhotos} maxPhotos={10} />

          <VideoPicker videos={videos} onChange={setVideos} maxVideos={3} />

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
            <FieldLabel>Caractéristiques</FieldLabel>
            <View className="flex-row gap-3">
              <NumberStepper icon="bed-outline" label="Chambres" value={bedroomsCount} onChange={setBedroomsCount} min={0} />
              <NumberStepper icon="shower" label="Salles de bain" value={bathroomsCount} onChange={setBathroomsCount} min={0} />
            </View>
            <View className="flex-row gap-3">
              <NumberStepper icon="sofa-outline" label="Salons" value={livingroomsCount} onChange={setLivingroomsCount} min={0} />
              <NumberStepper icon="garage-variant" label="Places garage" value={garageCarsCount} onChange={setGarageCarsCount} min={0} />
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

          <LocationPicker value={locationUrl} onChange={setLocationUrl} />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <GlassBlurRoot className="flex-1 bg-background" background={formContent}>
      <View className="absolute bottom-0 left-0 right-0 px-4" style={{ paddingBottom: insets.bottom + 12 }}>
        <GlassSurface intensity="thick" className="flex-row items-center gap-3 rounded-[26px] p-3">
          <Text className="flex-1 px-1 text-xs text-muted-foreground">
            {isValid
              ? `${photos.length} photo${photos.length > 1 ? 's' : ''} sélectionnée${photos.length > 1 ? 's' : ''}`
              : `Ajoute ${missingFields.join(', ')} pour publier.`}
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
              <Text className="font-semibold text-primary-foreground">
                {isEditing ? 'Mettre à jour' : 'Publier'}
              </Text>
            )}
          </Pressable>
        </GlassSurface>
      </View>
    </GlassBlurRoot>
  );
}
