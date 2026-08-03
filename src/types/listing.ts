import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type ListingFeatureIcon = keyof typeof MaterialCommunityIcons.glyphMap;

export interface ListingFeature {
  icon: ListingFeatureIcon;
  label: string;
}

// Ce que PropertyCard consomme — stable, indépendant du schéma DB
export interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  neighborhood: string;
  coverPhotoUrl: string;
  features: ListingFeature[];
}

// Ligne brute de la table `posts` — ton modèle réel
export interface Post {
  id: string;
  created_at: string;
  title: string;
  description: string;
  propertyType: 'House' | 'Apartment' | 'Condo' | 'Townhouse' | 'Land';
  rooms_count: number;
  price: number;
  country: string;
  status: boolean;
  city: string;
  neighborhood: string;
  photos_id: { '1': string; '2': string };
  user_id: string;
}