import { IMAGE_BASE_URL, PHOTO_BUCKET, VIDEO_BASE_URL, VIDEO_BUCKET, stripBaseUrl } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/types/listing';
import { useState } from 'react';

// Les erreurs Supabase (Postgrest comme Storage) portent l'info utile hors du
// `message` (hint SQL, code d'erreur S3-like) : on la loggue en entier pour
// le débogage, et on en tire un message plus actionnable que le générique
// "Error" pour l'alerte affichée à l'utilisateur.
function describeError(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { message?: string; hint?: string; code?: string; statusCode?: string };
    return [e.message, e.hint, e.code ?? e.statusCode].filter(Boolean).join(' — ');
  }
  return err instanceof Error ? err.message : String(err);
}

export type CreatePostInput = {
  title: string;
  description: string;
  propertyType: Post['property_type'];
  roomsCount: number;
  bedroomsCount: number;
  bathroomsCount: number;
  livingroomsCount: number;
  garageCarsCount: number;
  price: number;
  country: string;
  city: string;
  neighborhood: string;
  /** URIs — locales (nouveau média à uploader) ou URLs publiques déjà
   * existantes (média conservé tel quel en édition), une par photo. */
  photos: string[];
  /** Même logique que `photos`, pour les vidéos. */
  videos: string[];
  /** Lien Maps collé par l'utilisateur (optionnel). */
  locationUrl: string;
};

async function uploadToBucket(bucket: string, uri: string, userId: string, index: number) {
  const ext = /\.(\w+)$/.exec(uri)?.[1]?.toLowerCase() ?? 'jpg';
  const path = `public/${userId}-${Date.now()}-${index}.${ext}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const isVideo = bucket === VIDEO_BUCKET;
  const { error } = await supabase.storage.from(bucket).upload(path, arrayBuffer, {
    contentType: isVideo ? `video/${ext}` : `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    upsert: false,
  });

  if (error) {
    console.error(`[useCreatePost] échec upload ${bucket}/${path}`, error);
    throw error;
  }
  return path;
}

/**
 * Sépare les URIs déjà uploadées (URL publique existante, cas édition — on
 * ne les ré-uploade pas) des nouvelles (URI locale à uploader), puis
 * reconstruit un objet `{ "1": chemin, "2": chemin, ... }` dans l'ordre
 * d'origine.
 */
async function resolveMediaPaths(uris: string[], bucket: string, baseUrl: string, userId: string) {
  const paths = await Promise.all(
    uris.map((uri, index) =>
      uri.startsWith(baseUrl) ? stripBaseUrl(uri, baseUrl) : uploadToBucket(bucket, uri, userId, index)
    )
  );

  return paths.reduce<Record<string, string>>((acc, path, index) => {
    acc[String(index + 1)] = path;
    return acc;
  }, {});
}

export function useCreatePost() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildPayload = async (input: CreatePostInput, userId: string) => {
    const [photos_urls, videos_url] = await Promise.all([
      resolveMediaPaths(input.photos, PHOTO_BUCKET, IMAGE_BASE_URL, userId),
      resolveMediaPaths(input.videos, VIDEO_BUCKET, VIDEO_BASE_URL, userId),
    ]);

    return {
      title: input.title,
      description: input.description,
      property_type: input.propertyType,
      rooms_count: input.roomsCount,
      bedrooms_number: input.bedroomsCount,
      bathrooms_number: input.bathroomsCount,
      livingrooms_number: input.livingroomsCount,
      garage_cars_number: input.garageCarsCount,
      price: input.price,
      country: input.country,
      city: input.city,
      neighborhood: input.neighborhood,
      photos_urls,
      videos_url,
      location_url: input.locationUrl.trim() || null,
    };
  };

  const createPost = async (input: CreatePostInput) => {
    setSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Vous devez être connecté pour publier une annonce.');

      const payload = await buildPayload(input, user.id);

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({ ...payload, status: true, user_id: user.id })
        .select('id')
        .single();

      if (insertError) {
        console.error('[useCreatePost] échec insert posts', insertError);
        throw insertError;
      }

      return data.id as string;
    } catch (err) {
      const message = describeError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const updatePost = async (postId: string, input: CreatePostInput) => {
    setSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Vous devez être connecté pour modifier une annonce.');

      const payload = await buildPayload(input, user.id);

      const { error: updateError } = await supabase.from('posts').update(payload).eq('id', postId);

      if (updateError) {
        console.error('[useCreatePost] échec update posts', updateError);
        throw updateError;
      }

      return postId;
    } catch (err) {
      const message = describeError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return { createPost, updatePost, submitting, error };
}
