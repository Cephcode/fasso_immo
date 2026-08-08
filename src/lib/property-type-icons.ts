import type { Post } from '@/types/listing';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export const PROPERTY_TYPE_ICONS: Record<Post['property_type'], keyof typeof MaterialCommunityIcons.glyphMap> = {
  House: 'home-outline',
  Apartment: 'office-building-outline',
  Condo: 'domain',
  Townhouse: 'home-city-outline',
  Land: 'terrain',
};
