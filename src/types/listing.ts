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
  // Clés numériques en chaîne ('1', '2', '3'...), une par photo. Le nombre de
  // photos n'est pas limité à deux : c'est juste ce qu'on stocke pour l'instant.
  photos_id: Record<string, string>;
  user_id: string;
}

export interface ListingOwner {
  id:string
  name: string;
}