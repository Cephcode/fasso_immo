import { cn } from '@/lib/utils';
import { BlurView } from 'expo-blur';
import { GlassView as NativeGlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { cssInterop } from 'nativewind';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

// GlassView est un module natif tiers : nativewind ne convertit `className`
// en styles que pour les composants qu'il connaît déjà, il faut donc
// l'enregistrer explicitement pour pouvoir lui passer des classes Tailwind.
const GlassView = cssInterop(NativeGlassView, { className: 'style' });

type GlassIntensity = 'thin' | 'regular' | 'thick';

type GlassSurfaceProps = {
  children?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Force la densité du verre. `thin` pour une survolée légère, `thick` pour un panneau opaque. */
  intensity?: GlassIntensity;
  /** Teinte optionnelle du verre (iOS 26+ uniquement). */
  tintColor?: string;
  /** Rend le verre interactif au toucher (effet de compression iOS 26+). */
  interactive?: boolean;
  /** Ajoute un liseré translucide façon "bord de verre". */
  bordered?: boolean;
};

const BLUR_INTENSITY: Record<GlassIntensity, number> = {
  thin: 32,
  regular: 55,
  thick: 82,
};

const OVERLAY_OPACITY: Record<GlassIntensity, number> = {
  thin: 0.35,
  regular: 0.5,
  thick: 0.72,
};

/**
 * Surface "liquid glass" cohérente sur iOS (verre natif iOS 26+, sinon flou
 * UIVisualEffectView) comme sur Android (flou natif via expo-blur). Sert de
 * base à tous les éléments flottants de l'app : header, barre d'onglets,
 * boutons flottants, badges sur les photos, etc.
 */
export function GlassSurface({
  children,
  className,
  style,
  intensity = 'regular',
  tintColor,
  interactive = false,
  bordered = true,
}: GlassSurfaceProps) {
  const useNativeGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

  if (useNativeGlass) {
    return (
      <GlassView
        glassEffectStyle={intensity === 'thin' ? 'clear' : 'regular'}
        tintColor={tintColor}
        isInteractive={interactive}
        className={className}
        style={style}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View className={cn('overflow-hidden', bordered && 'border border-white/60', className)} style={style}>
      <BlurView
        intensity={BLUR_INTENSITY[intensity]}
        tint="light"
        blurMethod="dimezisBlurViewSdk31Plus"
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(255,255,255,${OVERLAY_OPACITY[intensity]})` }]}
      />
      {children}
    </View>
  );
}
