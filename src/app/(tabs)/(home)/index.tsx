import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function HomeScreen() {
  return (
    
    <SafeAreaView style={{ flex: 1}}>
      <StatusBar/>
      <View className="flex-1">
        <Text className="text-black dark:text-white">Home Screen</Text>
      </View>
    </SafeAreaView>
  );
}
