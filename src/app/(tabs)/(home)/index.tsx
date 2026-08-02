import { THEME } from '@/lib/theme';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function HomeScreen() {
  return (
    
    <SafeAreaView style={{ flex: 1}}>
      <StatusBar/>
      <View className="flex-1">
        <Text className="text-black dark:text-white">Home Screen</Text>

        <Pressable onPress={()=>{
          console.log(THEME.dark.primary)
        }}>
          <Text className="text-black dark:text-white">Log Theme</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
