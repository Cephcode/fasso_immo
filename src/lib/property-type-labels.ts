import type { Post } from '@/types/listing';

export const PROPERTY_TYPE_LABELS: Record<Post['property_type'], string> = {
  House: 'Maison',
  Apartment: 'Appartement',
  Condo: 'Condo',
  Townhouse: 'Maison de ville',
  Land: 'Terrain',
};