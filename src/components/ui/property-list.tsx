import { PropertyCard } from '@/components/ui/property-card';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import type { Listing } from '@/types/listing';
import { FlashList } from '@shopify/flash-list';
import { useColorScheme } from 'nativewind';
import { ActivityIndicator, View } from 'react-native';

type PropertyListProps = {
  listings: Listing[];
  loadingMore: boolean;
  refreshing: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
  onPressItem?: (listing: Listing) => void;
};

export function PropertyList({
  listings,
  loadingMore,
  refreshing,
  onEndReached,
  onRefresh,
  onPressItem,
}: PropertyListProps) {
  const { colorScheme } = useColorScheme();
  const colors = colorScheme === 'dark' ? THEME.dark : THEME.light;

  return (
    <FlashList
      data={listings}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ flex: 1, padding: 6 }}>
          <PropertyCard listing={item} onPress={onPressItem} />
        </View>
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={{ padding: 0 }}
      ListFooterComponent={
        loadingMore ? (
          <View className="py-4">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View className="items-center justify-center py-20">
          <Text className="text-muted-foreground">Aucune annonce pour le moment.</Text>
        </View>
      }
    />
  );
}