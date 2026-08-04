import { PropertyList } from '@/components/ui/property-list';
import { useSearchProperty } from '@/hooks/use-search-property';

import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
export default function HomeScreen() {

  const {query} = useLocalSearchParams<{query : string}>();
  const { listings, loading, error } = useSearchProperty(query);
  return (
    
    <View style={{ flex: 1,paddingHorizontal: 10 ,gap: 10 }} className='bg-primary-foreground'>
  

<PropertyList
  listings={listings}
  loadingMore={false}
  refreshing={loading}
  onEndReached={()=>{}}
  onRefresh={()=>{}}
/>

    </View>
  );
}

