import { SignUpForm } from '@/components/sign-up-form';
import { LogoBadge } from '@/components/ui/logo';

import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUpPage(){
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
            <LogoBadge size={56} />
            <Text className="text-[28px] font-bold tracking-tight text-foreground">Créer un compte</Text>
          </View>
          <View className="mt-8 w-full max-w-md self-center gap-6">
            <SignUpForm/>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
