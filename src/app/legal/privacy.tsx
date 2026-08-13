import { Text } from '@/components/ui/text';
import { FONT_DISPLAY_BOLD } from '@/lib/fonts';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Adresse de contact pour les questions liées aux données personnelles —
// à remplacer par une adresse dédiée (ex. contact@fassoimmo.com) si tu en
// crées une un jour ; en attendant, celle du développeur.
const PRIVACY_CONTACT_EMAIL = 'berecephas8@gmail.com';
const LAST_UPDATED = '13 août 2026';

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View className="gap-2">
      <Text className="text-base font-semibold text-foreground">{title}</Text>
      <Text className="text-sm leading-6 text-muted-foreground">{children}</Text>
    </View>
  );
}

/**
 * Politique de confidentialité affichée dans l'app (accessible depuis
 * l'inscription, voir sign-up-form.tsx) — rédigée simplement, en reflet
 * exact de ce que l'app collecte réellement, sans jargon juridique inutile.
 */
export default function PrivacyPolicyScreen() {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center gap-3 border-b border-border px-4 pb-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-full bg-secondary"
        >
          <MaterialCommunityIcons name="close" size={20} color={colors.foreground} />
        </Pressable>
        <Text className="flex-1 text-lg font-bold tracking-tight text-foreground">
          Politique de confidentialité
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 22 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1">
          <Text style={{ fontFamily: FONT_DISPLAY_BOLD }} className="text-[22px] tracking-tight text-foreground">
            Fasso Immo
          </Text>
          <Text className="text-xs text-muted-foreground">Dernière mise à jour : {LAST_UPDATED}</Text>
        </View>

        <Text className="text-sm leading-6 text-muted-foreground">
          Cette page explique, simplement, quelles informations Fasso Immo collecte, pourquoi, et comment tu peux
          les supprimer à tout moment.
        </Text>

        <Section title="Ce que nous collectons">
          {
            'Quand tu crées un compte : ton nom, prénom et ton email.\nQuand tu publies une annonce : les photos, vidéos, le prix, la ville, le quartier et les autres détails du bien.\nQuand tu contactes un autre utilisateur : le contenu de tes messages.\nPour les notifications : un identifiant technique de ton appareil (jeton push), pour pouvoir te prévenir des nouveaux messages.'
          }
        </Section>

        <Section title="Pourquoi nous les utilisons">
          {
            "Uniquement pour faire fonctionner l'app : créer et sécuriser ton compte, afficher tes annonces aux autres utilisateurs, te permettre d'échanger avec eux, et t'envoyer une notification quand tu reçois un message. Nous ne vendons aucune de tes données et ne les partageons avec aucun tiers à des fins publicitaires."
          }
        </Section>

        <Section title="Qui peut voir quoi">
          {
            "Les annonces (titre, photos, prix, localisation) sont publiques par nature — c'est le principe d'une place de marché. Tes messages ne sont visibles que par toi et la personne avec qui tu discutes. Ton email et ton mot de passe ne sont jamais visibles par les autres utilisateurs."
          }
        </Section>

        <Section title="Où sont stockées tes données">
          {
            "Tes données sont hébergées chez Supabase, un prestataire qui sécurise l'accès à la base de données : chaque utilisateur ne peut lire ou modifier que ce qui lui appartient."
          }
        </Section>

        <Section title="Combien de temps nous les gardons">
          {
            'Tant que ton compte existe. Si tu supprimes une annonce, ses photos et vidéos sont supprimées avec elle.'
          }
        </Section>

        <Section title="Supprimer tes données">
          {
            'Tu peux supprimer ton compte à tout moment depuis Profil > "Supprimer mon compte". Cette action supprime immédiatement et définitivement tes annonces, tes favoris, tes discussions, tes messages, ton jeton de notification, et ton compte lui-même. Cette action est irréversible.'
          }
        </Section>

        <Section title="Nous contacter">
          {`Pour toute question sur tes données, écris-nous à ${PRIVACY_CONTACT_EMAIL}.`}
        </Section>
      </ScrollView>
    </View>
  );
}
