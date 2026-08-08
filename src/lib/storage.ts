export const PHOTO_BUCKET = process.env.EXPO_PUBLIC_PHOTO_BUCKET ?? 'house_images';
export const VIDEO_BUCKET = process.env.EXPO_PUBLIC_VIDEO_BUCKET ?? 'house_videos';
export const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_BASE_URL ?? '';
export const VIDEO_BASE_URL = process.env.EXPO_PUBLIC_VIDEO_BASE_URL ?? '';

export const toImageUrl = (path: string) => (path ? `${IMAGE_BASE_URL}${path}` : '');
export const toVideoUrl = (path: string) => (path ? `${VIDEO_BASE_URL}${path}` : '');

// Reconstruit le chemin de storage à partir d'une URL publique déjà connue —
// utile en édition, quand un média existant ne doit pas être ré-uploadé.
export const stripBaseUrl = (url: string, base: string) => (url.startsWith(base) ? url.slice(base.length) : url);
