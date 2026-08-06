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
//
// Règle Android non négociable (doc expo-blur) : la `BlurView` doit être
// SŒUR de la `BlurTargetView` qu'elle cible, jamais nichée dedans — sinon
// elle essaie de se flouter elle-même et n'affiche plus rien. C'est pour ça
// que `GlassBlurRoot` sépare explicitement `background` (dans la cible) de
// `children` (à côté, jamais dedans).
const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

type GlassBlurRootProps = {
  /** Contenu à flouter (photo, carrousel, écran défilant...). */
  background: ReactNode;
  /** `GlassSurface` flottantes par-dessus le fond — jamais l'inverse. */
  children?: ReactNode;
  className?: string;
  /** Le conteneur doit avoir une taille déterminée (flex-1, aspect-ratio, ou width/height). */
  style?: StyleProp<ViewStyle>;
};

/**
 * Découpe une zone en deux couches : un fond flouté par les `GlassSurface`
 * passées en `children`, à côté (jamais dedans) sur Android. Sans Android,
 * empile simplement les deux dans une `View` classique.
 */
export function GlassBlurRoot({ background, children, className, style }: GlassBlurRootProps) {
  const targetRef = useRef<View>(null);

  if (Platform.OS !== 'android') {
    return (
      <View className={className} style={style}>
        {background}
        {children}
      </View>
    );
  }

  return (
    <View className={className} style={style}>
      <BlurTarget ref={targetRef} style={StyleSheet.absoluteFill}>
        {background}
      </BlurTarget>
      <BlurTargetContext.Provider value={targetRef}>{children}</BlurTargetContext.Provider>
    </View>
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

// Sans image/contenu coloré à flouter derrière (fond blanc uni), le voile
// blanc + un flou natif indisponible ne suffisent pas à faire "exister" la
// surface : il lui faut une ombre propre (et `elevation` pour qu'elle soit
// visible sur Android, où shadow* seul ne suffit pas toujours) pour se
// détacher du fond, comme les vrais matériaux "glass" d'Apple.
const DEFAULT_GLASS_SHADOW: ViewStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 5 },
  elevation: 4,
};

// `overflow-hidden` (nécessaire pour clipper le flou aux coins arrondis)
// coupe aussi l'ombre portée si elle est posée sur la même vue — sur iOS
// comme sur Android. On récupère donc juste les classes `rounded-*` pour
// les appliquer à la sous-couche clippée, et l'ombre reste sur la vue du
// dessus, non clippée.
function extractRoundedClasses(className?: string) {
  return (className ?? '')
    .split(/\s+/)
    .filter((token) => token.startsWith('rounded'))
    .join(' ');
}

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
        className={cn('items-center justify-center', className)}
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
  const roundedClasses = extractRoundedClasses(className);

  return (
    <View
      className={cn('items-center justify-center', bordered && 'border border-black/10', className)}
      style={[DEFAULT_GLASS_SHADOW, style]}
    >
      <View pointerEvents="none" className={cn('overflow-hidden', roundedClasses)} style={StyleSheet.absoluteFill}>
        <BlurView
          intensity={BLUR_INTENSITY[intensity]}
          tint="light"
          blurMethod={androidBlurMethod}
          blurTarget={blurTarget ?? undefined}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(255,255,255,${OVERLAY_OPACITY[intensity]})` }]}
        />
      </View>
      {children}
    </View>
  );
}
