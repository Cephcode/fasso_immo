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
import { ActivityIndicator, Alert, TextInput, TouchableOpacity, View } from 'react-native';

export function SignUpForm() {
  const router = useRouter();
  // Permet de revenir sur l'écran d'origine après inscription (ex. l'onglet
  // Publier, qui redirige ici en passant `?redirect=/(tabs)/publish`).
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const passwordInputRef = React.useRef<TextInput>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');

  // UI states
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    setErrorMessage(null);

    // Validation rapide des champs
    if (!email.trim() || !password || !firstName.trim() || !lastName.trim()) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      // Si Supabase requiert une confirmation par email
      if (data.user && data.session === null) {
        Alert.alert(
          'Compte créé !',
          'Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception.',
          [
            {
              text: 'OK',
              onPress: () => router.push({ pathname: '/auth/login', params: redirect ? { redirect } : undefined }),
            },
          ]
        );
      } else {
        // Redirection vers l'écran d'origine (ou l'accueil) si l'authentification est directe
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
            Trouvez rapidement une offre ou postez la vôtre.
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

            <View className="gap-1.5">
              <Label htmlFor="lastName">Noms</Label>
              <Input
                id="lastName"
                placeholder="Nom..."
                value={lastName}
                onChangeText={setLastName}
                returnKeyType="next"
              />
            </View>

            <View className="gap-1.5">
              <Label htmlFor="firstName">Prénoms</Label>
              <Input
                id="firstName"
                placeholder="Prénoms..."
                value={firstName}
                onChangeText={setFirstName}
                returnKeyType="next"
              />
            </View>

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

            {/* Champ Mot de passe avec Icône intégrée */}
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

            <Button
              className="mt-2 w-full"
              size="lg"
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={THEME.light.primaryForeground} />
              ) : (
                <Text className="font-semibold text-primary-foreground">Continuer</Text>
              )}
            </Button>
          </View>

          <Text className="text-center text-sm text-muted-foreground">
            Vous avez déjà un compte ?{' '}
            <Text
              onPress={() => router.push({ pathname: '/auth/login', params: redirect ? { redirect } : undefined })}
              className="text-sm font-semibold text-primary"
            >
              Connectez-vous
            </Text>
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}