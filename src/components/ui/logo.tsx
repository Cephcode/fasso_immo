import { THEME } from '@/lib/theme';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

// Silhouette de maison exacte du design (doc 1a "Identité") : une seule
// forme pleine, sans contour ni fenêtre, qui doit rester lisible aussi
// bien à 16px qu'à 512px. Reproduite telle quelle depuis le SVG de la
// maquette (viewBox 24x24, même jeu de points) plutôt qu'approximée avec
// une icône générique du pack Material Community Icons.
const HOUSE_POINTS = '12,3 22,11 19,11 19,21 14,21 14,15 10,15 10,21 5,21 5,11 2,11';

type HouseIconProps = {
  /** Taille du SVG (carré), en px. */
  size: number;
  /** Couleur de la silhouette — blanc sur la tuile orange, orange en mono. */
  color?: string;
};

export function HouseIcon({ size, color = '#fff' }: HouseIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points={HOUSE_POINTS} fill={color} />
    </Svg>
  );
}

type LogoBadgeProps = {
  /** Taille du badge carré (le "squircle" orange), en px. */
  size?: number;
  /** Rayon des coins — proportionnel à `size` par défaut, comme dans le design (~29% de la taille). */
  borderRadius?: number;
};

/** Badge carré orange + silhouette de maison blanche — le mot-marque visuel
 * de l'app, utilisé partout où le logo apparaît (header, écrans de connexion). */
export function LogoBadge({ size = 30, borderRadius }: LogoBadgeProps) {
  const colors = THEME.light;
  const radius = borderRadius ?? Math.round(size * 0.29);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 0.5 (pas 0.4) : ratio exact du design (maison 38px dans un badge
          76px). Une valeur plus petite marchait pour l'icône système — un
          gros carré, vu à distance sur l'écran d'accueil — mais rendait la
          maison ridiculement petite dans les usages en app (badge 30px de
          l'en-tête, 56px des écrans de connexion, 76px du splash JS), où
          elle doit rester lisible à taille réelle sur l'écran. */}
      <HouseIcon size={Math.round(size * 0.5)} color={colors.primaryForeground} />
    </View>
  );
}
