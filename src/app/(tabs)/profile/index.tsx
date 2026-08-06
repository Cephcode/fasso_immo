import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <MaterialCommunityIcons name="account-outline" size={26} color={THEME.light.primary} />
      </View>
      <Text className="text-lg font-semibold text-foreground">Profil</Text>
      <Text className="text-center text-sm text-muted-foreground">
        Vos informations et vos annonces publiées apparaîtront ici.
      </Text>
    </View>
  );
}
