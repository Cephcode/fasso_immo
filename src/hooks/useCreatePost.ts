import { supabase } from '@/lib/supabase';
import type { Post } from '@/types/listing';
import { useState } from 'react';

// Bucket Supabase Storage servant de base à EXPO_PUBLIC_IMAGE_BASE_URL — les
// chemins qu'on y stocke sont ensuite préfixés par cette base pour l'affichage.
const PHOTO_BUCKET = 'house_images';

export type CreatePostInput = {
  title: string;
  description: string;
  propertyType: Post['propertyType'];
  roomsCount: number;
  price: number;
  country: string;
  city: string;
  neighborhood: string;
  /** URIs locales (expo-image-picker), une par photo — nombre libre. */
  photos: string[];
};

async function uploadPhoto(uri: string, userId: string, index: number) {
  const ext = /\.(\w+)$/.exec(uri)?.[1]?.toLowerCase() ?? 'jpg';
  const path = `${userId}/${Date.now()}-${index}.${ext}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, arrayBuffer, {
    contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    upsert: false,
  });

  if (error) throw error;
  return path;
}

export function useCreatePost() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (input: CreatePostInput) => {
    setSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Vous devez être connecté pour publier une annonce.');

      const uploadedPaths = await Promise.all(
        input.photos.map((uri, index) => uploadPhoto(uri, user.id, index))
      );

      const photos_id = uploadedPaths.reduce<Record<string, string>>((acc, path, index) => {
        acc[String(index + 1)] = path;
        return acc;
      }, {});

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          title: input.title,
          description: input.description,
          property_type: input.propertyType,
          rooms_count: input.roomsCount,
          price: input.price,
          country: input.country,
          city: input.city,
          neighborhood: input.neighborhood,
          photos_id,
          status: true,
          user_id: user.id,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      return data.id as string;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue lors de la publication.';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { createPost, submitting, error };
}
