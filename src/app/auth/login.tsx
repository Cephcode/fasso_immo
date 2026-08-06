import LoginForm from '@/components/login-form';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginPage(){
  const colors = THEME.light;
  const insets = useSafeAreaInsets();

    return (
<KeyboardAvoidingView
        behavior={'padding'}
        className="flex-1 bg-background"
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
          <View className="items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <MaterialCommunityIcons name="home-city-outline" size={26} color={colors.primary} />
            </View>
            <Text className="text-[28px] font-bold tracking-tight text-foreground">Bon retour</Text>
          </View>
          <View className="mt-8 w-full max-w-md self-center gap-6">
            <LoginForm/>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
