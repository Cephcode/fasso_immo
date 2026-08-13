import { LogoBadge } from '@/components/ui/logo';
import { FONT_DISPLAY_BOLD } from '@/lib/fonts';
import { Text, View } from 'react-native';

// Redesign v2 (doc 1a "Identité", section "Splash screen") : fond blanc
// plein écran, badge + mot-marque + accroche centrés. Le splash natif (voir
// app.json / expo-splash-screen) ne peut afficher qu'une seule image
// statique, donc pas de texte — cet écran JS reproduit le design complet et
// prend le relais juste après, le temps que la marque s'affiche (voir
// _layout.tsx).
export function BrandedSplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white" style={{ gap: 22 }}>
      <LogoBadge size={76} />

      <Text style={{ fontFamily: FONT_DISPLAY_BOLD }} className="text-[28px] tracking-tight text-foreground">
        Fasso Immo
      </Text>

      <Text className="max-w-[220px] text-center text-[15px] leading-[22px]" style={{ color: '#6D6D79' }}>
        Trouve ton chez-toi,{'\n'}au quartier près.
      </Text>
    </View>
  );
}
