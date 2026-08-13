import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking, Pressable, View } from 'react-native';

type LocationPickerProps = {
  value: string;
  onChange: (url: string) => void;
};

// Recherche générique Maps (pas de requête précise ici : c'est le "Ouvrir
// Maps" de base, l'utilisateur cherche et épingle lui-même son bien).
const MAPS_SEARCH_URL = 'https://www.google.com/maps';

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const colors = THEME.light;

  const openMaps = () => {
    Linking.openURL(MAPS_SEARCH_URL);
  };

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-foreground">Localisation</Text>
      <Text className="text-xs text-muted-foreground">
        Ouvre Maps, cherche l&apos;emplacement du bien, appuie sur « Partager » puis colle le lien ci-dessous.
      </Text>

      <Pressable
        onPress={openMaps}
        className="flex-row items-center justify-center gap-2 rounded-full bg-secondary py-3"
      >
        <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.primaryText} />
        <Text className="text-sm font-semibold text-primary-text">Ouvrir Maps pour choisir un emplacement</Text>
      </Pressable>

      <Input
        value={value}
        onChangeText={onChange}
        placeholder="Colle le lien Maps ici"
        leftIcon="link"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
    </View>
  );
}
