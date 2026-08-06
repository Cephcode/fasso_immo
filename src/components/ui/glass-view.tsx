import { cn } from '@/lib/utils';
import { BlurTargetView, BlurView, type BlurMethod } from 'expo-blur';
import { GlassView as NativeGlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { cssInterop } from 'nativewind';
import { createContext, useContext, useRef, type ReactNode, type RefObject } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

// GlassView est un module natif tiers : nativewind ne convertit `className`
// en styles que pour les composants qu'il connaît déjà, il faut donc
// l'enregistrer explicitement pour pouvoir lui passer des classes Tailwind.
const GlassView = cssInterop(NativeGlassView, { className: 'style' });
const BlurTarget = cssInterop(BlurTargetView, { className: 'style' });

// Sur Android, expo-blur n'a pas d'équivalent du flou "backdrop" natif d'iOS :
// il doit recevoir la référence de la vue à flouter (`blurTarget`). On la
// fournit via ce contexte, posé par `GlassBlurRoot` autour du contenu que les
// `GlassSurface` flottantes doivent flouter (photo, écran, etc.).
const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

type GlassBlurRootProps = {
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Enveloppe le contenu qui doit apparaître flouté derrière les `GlassSurface`
 * (photo de carte, galerie, écran entier derrière une barre flottante...).
 * Sans Android, ne fait rien de plus qu'une `View` classique.
 */
export function GlassBlurRoot({ children, className, style }: GlassBlurRootProps) {
  const targetRef = useRef<View>(null);

  if (Platform.OS !== 'android') {
    return (
      <View className={className} style={style}>
        {children}
      </View>
    );
  }

  return (
    <BlurTargetContext.Provider value={targetRef}>
      <BlurTarget ref={targetRef} className={className} style={style}>
        {children}
      </BlurTarget>
    </BlurTargetContext.Provider>
  );
}

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
  const blurTarget = useContext(BlurTargetContext);

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

  // Sans `blurTarget` sur Android, `dimezisBlurViewSdk31Plus` retombe sur
  // "none" en émettant un warning à chaque rendu : on choisit "none"
  // explicitement dans ce cas pour rester silencieux et ne garder que le
  // voile translucide (dégradé propre plutôt que flou natif indisponible).
  const androidBlurMethod: BlurMethod = blurTarget ? 'dimezisBlurViewSdk31Plus' : 'none';

  return (
    <View className={cn('overflow-hidden', bordered && 'border border-white/60', className)} style={style}>
      <BlurView
        intensity={BLUR_INTENSITY[intensity]}
        tint="light"
        blurMethod={androidBlurMethod}
        blurTarget={blurTarget ?? undefined}
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
