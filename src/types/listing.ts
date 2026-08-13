// Ce que PropertyCard consomme — stable, indépendant du schéma DB
export interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  neighborhood: string;
  coverPhotoUrl: string;
  // Redesign v2 : la carte affiche des pastilles chambres/salles de bain
  // dédiées (voir property-card.tsx) plutôt qu'une liste générique de
  // caractéristiques — `null` quand l'annonce ne renseigne pas le champ.
  bedrooms: number | null;
  bathrooms: number | null;
}

// Ligne brute de la table `posts` — ton modèle réel
export interface Post {
  id: string;
  created_at: string;
  title: string;
  description: string;
  // camelCase ici casserait l'accès direct aux lignes `select('*')` — la
  // vraie colonne Postgres est `property_type`, comme tous les autres champs.
  property_type: 'House' | 'Apartment' | 'Condo' | 'Townhouse' | 'Land';
  rooms_count: number;
  // Absents (null) sur les annonces publiées avant l'ajout de ces colonnes.
  bedrooms_number: number | null;
  bathrooms_number: number | null;
  livingrooms_number: number | null;
  garage_cars_number: number | null;
  price: number;
  country: string;
  status: boolean;
  city: string;
  neighborhood: string;
  // Clés numériques en chaîne ('1', '2', '3'...), une par photo/vidéo. Le
  // nombre d'éléments n'est pas limité : c'est juste ce qu'on stocke.
  photos_urls: Record<string, string>;
  videos_url: Record<string, string>;
  // Lien Google/Apple Maps vers l'emplacement, collé par l'annonceur
  // (partagé depuis l'app Maps native) — absent si non renseigné.
  location_url: string | null;
  user_id: string;
}

export interface ListingOwner {
  id:string
  name: string;
}