import { GlassSurface } from '@/components/ui/glass-view';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SearchResultsHeaderProps = {
  query: string;
  resultCount: number;
  loading?: boolean;
  onBack: () => void;
  onSubmitQuery: (query: string) => void;
};

/**
 * Header de la page de résultats : distinct du header principal (pas de logo,
 * bouton retour + champ de recherche modifiable + décompte des résultats).
 */
export function SearchResultsHeader({
  query,
  resultCount,
  loading,
  onBack,
  onSubmitQuery,
}: SearchResultsHeaderProps) {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();
  const [text, setText] = useState(query);

  const submit = () => {
    const trimmed = text.trim();
    if (trimmed && trimmed !== query) onSubmitQuery(trimmed);
  };

  return (
    <GlassSurface
      intensity="regular"
      bordered={false}
      className="w-full border-b border-border/60"
      style={{ paddingTop: insets.top + 10 }}
    >
      <View className="w-full gap-2.5 px-4 pb-3">
        <View className="flex-row items-center gap-2.5">
          <Pressable
            onPress={onBack}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full bg-secondary"
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color={colors.foreground} />
          </Pressable>

          <View className="flex-1">
            <Input
              value={text}
              onChangeText={setText}
              onSubmitEditing={submit}
              onBlur={submit}
              leftIcon="search"
              returnKeyType="search"
              placeholder="Rechercher une ville, un quartier..."
            />
          </View>
        </View>

        <Text className="px-1 text-xs text-muted-foreground">
          {loading
            ? 'Recherche en cours…'
            : `${resultCount} résultat${resultCount > 1 ? 's' : ''} pour « ${query} »`}
        </Text>
      </View>
    </GlassSurface>
  );
}
