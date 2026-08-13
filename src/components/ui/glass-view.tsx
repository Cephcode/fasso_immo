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

// Redesign v2 (règle explicite du design system) : le voile blanc a deux
// paliers. Quand le flou natif fonctionne réellement derrière lui, il reste
// fin (.34/.46/.58) pour laisser deviner le contenu flouté — c'est ça, l'effet
// "verre". Mais quand aucun flou n'est disponible (Android < SDK 31, pas de
// cible de flou), un voile aussi fin ne suffit plus à distinguer la surface :
// combiné à une photo non floutée derrière, ça donnait l'impression d'une
// surface "grisée"/sale plutôt que d'un panneau de verre. Sans flou, le voile
// monte donc à .82/.88/.93 (quasi opaque) : la hiérarchie visuelle tient
// seule, sans effet de flou raté.
const OVERLAY_OPACITY_BLURRED: Record<GlassIntensity, number> = {
  thin: 0.34,
  regular: 0.46,
  thick: 0.58,
};

const OVERLAY_OPACITY_FALLBACK: Record<GlassIntensity, number> = {
  thin: 0.82,
  regular: 0.88,
  thick: 0.93,
};

// `dimezisBlurViewSdk31Plus` exige Android 12 (API 31) au minimum ; en
// dessous, expo-blur ne peut de toute façon rien flouter. `Platform.Version`
// est déjà l'API level sur Android (contrairement à iOS où c'est une string).
const ANDROID_BLUR_MIN_SDK = 31;
function isAndroidBlurCapable() {
  return Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= ANDROID_BLUR_MIN_SDK;
}

// Sans image/contenu coloré à flouter derrière (fond blanc uni), le voile
// blanc + un flou natif indisponible ne suffisent pas à faire "exister" la
// surface : il lui faut une ombre propre (et `elevation` pour qu'elle soit
// visible sur Android, où shadow* seul ne suffit pas toujours) pour se
// détacher du fond, comme les vrais matériaux "glass" d'Apple.
// #100C08 (et non #000) : règle explicite du design system — "ombres
// teintées chaud, jamais noir pur". Un détail, mais un gris/noir pur sur du
// verre lit comme générique/Material ; la teinte chaude fait "matériau"
// plutôt que "case à cocher d'ombre portée".
const DEFAULT_GLASS_SHADOW: ViewStyle = {
  shadowColor: '#100C08',
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

  // Le flou natif ne fonctionne réellement que : sur iOS (UIVisualEffectView
  // floute toujours ce qu'il y a derrière, sans cible) ; sur Android, unique-
  // ment avec une `blurTarget` ET un SDK ≥ 31 (voir isAndroidBlurCapable).
  // Sinon, `BlurView` ne peut rien flouter — on évite alors de la monter :
  // certaines versions d'expo-blur peignent leur propre teinte de repli
  // quand elles ne peuvent pas flouter, qui s'additionnait à notre voile et
  // donnait cet aspect "sale"/grisé au lieu d'un panneau net.
  const androidBlurAvailable = isAndroidBlurCapable() && blurTarget != null;
  const blurWorks = Platform.OS === 'ios' || androidBlurAvailable;
  const androidBlurMethod: BlurMethod = androidBlurAvailable ? 'dimezisBlurViewSdk31Plus' : 'none';
  const overlayOpacity = (blurWorks ? OVERLAY_OPACITY_BLURRED : OVERLAY_OPACITY_FALLBACK)[intensity];
  const roundedClasses = extractRoundedClasses(className);

  return (
    <View
      className={cn('items-center justify-center', bordered && 'border border-black/10', className)}
      style={[DEFAULT_GLASS_SHADOW, style]}
    >
      <View pointerEvents="none" className={cn('overflow-hidden', roundedClasses)} style={StyleSheet.absoluteFill}>
        {blurWorks && (
          <BlurView
            intensity={BLUR_INTENSITY[intensity]}
            tint="light"
            blurMethod={androidBlurMethod}
            blurTarget={blurTarget ?? undefined}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(255,255,255,${overlayOpacity})` }]} />
      </View>
      {children}
    </View>
  );
}
