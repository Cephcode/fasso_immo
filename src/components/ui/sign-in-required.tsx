import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SignInRequiredProps = {
  title?: string;
  message?: string;
  /** Route vers laquelle revenir après connexion/inscription. */
  redirect: string;
};

// Écran affiché à la place d'un onglet réservé aux utilisateurs connectés
// (Publier, Profil...) tant que l'utilisateur n'est pas authentifié. Sert de
// garde-fou pour les accès directs (deep link, retour en arrière, etc.) : le
// blocage principal se fait en amont, sur l'appui de l'onglet lui-même (voir
// (tabs)/_layout.tsx).
export function SignInRequired({
  title = 'Connexion requise',
  message = 'Connecte-toi ou crée un compte pour continuer.',
  redirect,
}: SignInRequiredProps) {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center justify-center gap-4 bg-background px-8"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-tint">
        <MaterialCommunityIcons name="lock-outline" size={26} color={colors.tintForeground} />
      </View>
      <View className="gap-1">
        <Text className="text-center text-lg font-semibold text-foreground">{title}</Text>
        <Text className="text-center text-sm text-muted-foreground">{message}</Text>
      </View>
      <View className="w-full max-w-xs gap-3 pt-2">
        <Button className="w-full" size="lg" onPress={() => router.push({ pathname: '/auth/login', params: { redirect } })}>
          <Text className="font-semibold text-primary-foreground">Se connecter</Text>
        </Button>
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onPress={() => router.push({ pathname: '/auth/sign-up', params: { redirect } })}
        >
          <Text className="font-semibold text-foreground">Créer un compte</Text>
        </Button>
      </View>
    </View>
  );
}
