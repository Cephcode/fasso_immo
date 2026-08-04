import { PropertyList } from '@/components/ui/property-list';

import { useListings } from '@/hooks/useListings';
import { View } from 'react-native';
export default function HomeScreen() {
  const { listings, loadingMore, refreshing, loadMore, refresh } = useListings();
  return (
    
    <View style={{ flex: 1,paddingHorizontal: 10 ,gap: 10 }} className='bg-primary-foreground'>
  

<PropertyList
  listings={listings}
  loadingMore={loadingMore}
  refreshing={refreshing}
  onEndReached={loadMore}
  onRefresh={refresh}
/>

    </View>
  );
}
