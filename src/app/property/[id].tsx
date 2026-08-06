import { PropertyDetail } from '@/components/ui/property-details';
import { Text } from '@/components/ui/text';
import { supabase } from '@/lib/supabase';
import { THEME } from '@/lib/theme';
import type { Post } from '@/types/listing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [id]);

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

  return <PropertyDetail post={post} onBack={() => router.back()} />;
}