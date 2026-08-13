import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { supabase } from '@/lib/supabase';
import { THEME } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
import { ActivityIndicator, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginForm() {
  const router = useRouter();
  // Permet de revenir sur l'écran d'origine après connexion (ex. l'onglet
  // Publier, qui redirige ici en passant `?redirect=/(tabs)/publish`).
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const passwordInputRef = React.useRef<TextInput>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI states
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    setErrorMessage(null);

    // Validation basique
    if (!email.trim() || !password) {
      setErrorMessage('Veuillez remplir votre email et votre mot de passe.');
      return;
    }

    try {
      setLoading(true);

      // Authentification Supabase par email + mot de passe
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        // Personnalisation éventuelle des erreurs courantes de Supabase
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Email ou mot de passe incorrect.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      // Succès -> Redirection vers l'écran d'origine (ou l'accueil par défaut)
      if (data.session) {
        router.replace((redirect as Href) ?? '/(tabs)/(home)');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="gap-6">
      <Card className="border-transparent bg-transparent p-0 shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-center text-base font-medium text-muted-foreground">
            Connectez-vous à votre compte pour continuer.
          </CardTitle>
        </CardHeader>
        <CardContent className="gap-6 px-0">
          <View className="gap-5">

            {/* Message d'erreur dynamique */}
            {errorMessage && (
              <View className="rounded-2xl bg-destructive/10 p-3">
                <Text className="text-center text-xs font-medium text-destructive">
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Champ Email */}
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>

            {/* Champ Mot de passe avec Icône de masque/démaquillage */}
            <View className="gap-1.5">
              <Label htmlFor="password">Mot de passe</Label>

              <View className="relative justify-center">
                <Input
                  ref={passwordInputRef}
                  id="password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  returnKeyType="send"
                  onSubmitEditing={onSubmit}
                  className="pr-11"
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute right-4 p-1"
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off' : 'eye'}
                    size={19}
                    color={THEME.light.mutedForeground}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bouton de Soumission */}
            <Button
              className="mt-2 w-full"
              size="lg"
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={THEME.light.primaryForeground} />
              ) : (
                <Text className="font-semibold text-primary-foreground">Se connecter</Text>
              )}
            </Button>
          </View>

          {/* Redirection vers l'inscription */}
          <Text className="text-center text-sm text-muted-foreground">
            Vous n&apos;avez pas encore de compte ?{' '}
            <Text
              onPress={() => router.push({ pathname: '/auth/sign-up', params: redirect ? { redirect } : undefined })}
              className="text-sm font-semibold text-primary-text"
            >
              Créez-en un
            </Text>
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}