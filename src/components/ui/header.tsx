
import Search from '@/components/ui/search';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header() {
  const { colorScheme } = useColorScheme();
  const colors = colorScheme === 'dark' ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();

  return (
    <View
      className="w-full gap-3 px-4 pb-4"
      style={[styles.shadowBox, { shadowColor: colors.foreground, paddingTop: insets.top + 8,backgroundColor:colors.primaryForegroundSecond}]}
    >
      <View className="flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <MaterialCommunityIcons name="home-city-outline" size={20} color={colors.primary} />
        </View>
        <Text className="text-2xl font-bold tracking-tight text-primary">Fasso Immo</Text>
      </View>

      <Search/>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowBox: {
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});