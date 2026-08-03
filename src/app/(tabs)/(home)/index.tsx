import Search from '@/components/ui/search';
import { THEME } from '@/lib/theme';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function HomeScreen() {
  return (
    
    <SafeAreaView style={{ flex: 1,backgroundColor: THEME.light.primaryForeground ,paddingHorizontal: 10 }}>
      <StatusBar/>
      <Search/>

    </SafeAreaView>
  );
}
