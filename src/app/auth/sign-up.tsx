 import { SignUpForm } from '@/components/sign-up-form';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useColorScheme } from 'nativewind';

import { KeyboardAvoidingView, Platform, ScrollView, Text, View, } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function signUpPage(){
const { colorScheme } = useColorScheme();
  const colors = colorScheme === 'dark' ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
    return (
<KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-primary-foreground"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
                <View className="flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <MaterialCommunityIcons name="home-city-outline" size={20} color={colors.primary} />
        </View>
        <Text className="text-2xl font-bold tracking-tight text-foreground">Fasso Immo</Text>
      </View>
          <View className="w-full max-w-md self-center gap-6">
            <SignUpForm/>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
