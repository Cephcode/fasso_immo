import type { Post } from '@/types/listing';

export const PROPERTY_TYPE_LABELS: Record<Post['propertyType'], string> = {
  House: 'Maison',
  Apartment: 'Appartement',
  Condo: 'Condo',
  Townhouse: 'Maison de ville',
  Land: 'Terrain',
};