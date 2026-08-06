import Search from '@/components/ui/search';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header() {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();

  return (
    <View
      className="w-full gap-4 border-b border-border bg-background px-4 pb-4"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center gap-2.5">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <MaterialCommunityIcons name="home-city-outline" size={18} color={colors.primary} />
        </View>
        <Text className="text-xl font-semibold tracking-tight text-foreground">Fasso Immo</Text>
      </View>

      <Search />
    </View>
  );
}
