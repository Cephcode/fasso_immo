import { PropertyCard } from '@/components/ui/property-card';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import type { Listing } from '@/types/listing';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

type PropertyListProps = {
  listings: Listing[];
  loadingMore: boolean;
  refreshing: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
  onPressItem?: (listing: Listing) => void};

export function PropertyList({
  listings,
  loadingMore,
  refreshing,
  onEndReached,
  onRefresh,
  onPressItem,
}: PropertyListProps) {
  const colors = THEME.light;

  const handleItemPressed=(listing:Listing)=>{
    router.push({
      pathname: "/property/[id]",

      params:{
        id: listing.id     
      }
    })
  }

  return (
    <FlashList
      data={listings}
      numColumns={1}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ flex: 1, paddingHorizontal: 2, paddingVertical: 8 }}>
          <PropertyCard listing={item} onPress={handleItemPressed} />
        </View>
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={{ padding: 0, paddingBottom: 16 }}
      ListFooterComponent={
        loadingMore ? (
          <View className="py-4">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View className="items-center justify-center gap-2 py-24">
          <Text className="text-sm text-muted-foreground">Aucune annonce pour le moment.</Text>
        </View>
      }
    />
  );
}