import { PropertyDetail } from '@/components/ui/property-details';
import { Text } from '@/components/ui/text';
import { getOrCreateDiscussion } from '@/lib/discussions';
import { formatInterestMessage } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { THEME } from '@/lib/theme';
import type { Post } from '@/types/listing';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, View } from 'react-native';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [id]);

  // Rechargé au montage (nouvel `id`) et à chaque retour sur l'écran, pour
  // refléter une modification faite entre-temps (ex. depuis "Mes annonces").
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function fetchPost() {
        const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();

        if (isMounted) {
          if (!error) setPost(data);
          setLoading(false);
        }
      }

      if (id) fetchPost();
      return () => {
        isMounted = false;
      };
    }, [id])
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={THEME.light.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-sm text-muted-foreground">Annonce introuvable.</Text>
      </View>
    );
  }

  const handleContactPress = async () => {
    try {
      const discussionId = await getOrCreateDiscussion(post.user_id, post.id);
      router.push({ pathname: '/discussion/[id]', params: { id: discussionId } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible d'ouvrir la discussion.";
      Alert.alert('Message impossible', message);
    }
  };

  // "Je suis intéressé" : même discussion que "Message", mais avec un
  // message pré-rempli côté écran de discussion (voir la query `prefill` et
  // discussion/[id].tsx) — l'utilisateur peut encore le modifier avant
  // d'envoyer, on ne l'envoie jamais automatiquement à sa place.
  const handleInterestedPress = async () => {
    try {
      const discussionId = await getOrCreateDiscussion(post.user_id, post.id);
      router.push({
        pathname: '/discussion/[id]',
        params: { id: discussionId, prefill: formatInterestMessage(post.title) },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible d'ouvrir la discussion.";
      Alert.alert('Message impossible', message);
    }
  };

  const handleOpenMaps = () => {
    if (post.location_url) Linking.openURL(post.location_url);
  };

  return (
    <PropertyDetail
      post={post}
      onBack={() => router.back()}
      onContactPress={handleContactPress}
      onInterestedPress={handleInterestedPress}
      onOpenMaps={handleOpenMaps}
    />
  );
}