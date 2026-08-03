import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { Platform, StyleSheet, View } from 'react-native';

export default function Header() {
  const { colorScheme } = useColorScheme();
  const colors = colorScheme === 'dark' ? THEME.dark : THEME.light;

  return (
    <View
      className="w-full justify-end min-h-20 items-center md:py-8"
      style={[styles.shadowBox,{ shadowColor: colors.foreground , borderBottomColor: colors.background,zIndex: 10,backgroundColor: colors.background }]}
    >
      <Text className="text-3xl font-bold text-primary md:text-3xl lg:text-4xl">
        Fasso Immo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowBox: {
    paddingBottom: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 0.5, // needs to be higher than the Stack content's elevation (default 0) to paint on top
      },
    }),
  },
});