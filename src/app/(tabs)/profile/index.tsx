import { SignInRequired } from '@/components/ui/sign-in-required';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/hooks/useAuth';
import { mapRowToListing } from '@/hooks/useListings';
import { FONT_DISPLAY_BOLD } from '@/lib/fonts';
import { formatPrice } from '@/lib/format';
import { PHOTO_BUCKET, VIDEO_BUCKET } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { THEME } from '@/lib/theme';
import type { Listing } from '@/types/listing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MyPost = {
  listing: Listing;
  photoPaths: string[];
  videoPaths: string[];
};

type UserInfo = {
  email: string;
  fullName: string;
};

function MyPostCard({ post, onEdit, onDelete }: { post: MyPost; onEdit: () => void; onDelete: () => void }) {
  const colors = THEME.light;

  return (
    <View className="flex-row gap-3 rounded-[22px] bg-card p-3 shadow-sm shadow-black/5">
      <Image
        source={{ uri: post.listing.coverPhotoUrl }}
        contentFit="cover"
        style={{ width: 72, height: 72, borderRadius: 14 }}
      />
      <View className="flex-1 justify-center gap-1">
        <Text numberOfLines={1} className="text-sm font-semibold text-card-foreground">
          {post.listing.title}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {post.listing.city}, {post.listing.neighborhood}
        </Text>
        <Text className="text-sm font-bold text-primary-text">{formatPrice(post.listing.price)}</Text>
      </View>
      <View className="justify-center gap-2">
        <Pressable
          onPress={onEdit}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-secondary"
        >
          <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.foreground} />
        </Pressable>
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-destructive/10"
        >
          <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.destructive} />
        </Pressable>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useAuth();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setUser(null);
      setPosts([]);
      setLoading(false);
      return;
    }

    const metadata = authUser.user_metadata as { first_name?: string; last_name?: string } | null;
    const fullName = [metadata?.first_name, metadata?.last_name].filter(Boolean).join(' ');
    setUser({ email: authUser.email ?? '', fullName: fullName || 'Utilisateur' });

    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false });

    setPosts(
      (data ?? []).map((row) => ({
        listing: mapRowToListing(row),
        photoPaths: Object.values(row.photos_urls ?? {}).filter(Boolean) as string[],
        videoPaths: Object.values(row.videos_url ?? {}).filter(Boolean) as string[],
      }))
    );
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        load();
      } else if (isLoggedIn === false) {
        setUser(null);
        setPosts([]);
        setLoading(false);
      }
    }, [isLoggedIn, load])
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleEdit = (post: MyPost) => {
    router.push({ pathname: '/(tabs)/publish', params: { editId: post.listing.id } });
  };

  const handleDelete = (post: MyPost) => {
    Alert.alert('Supprimer cette annonce ?', 'Cette action est définitive.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            if (post.photoPaths.length > 0) {
              await supabase.storage.from(PHOTO_BUCKET).remove(post.photoPaths);
            }
            if (post.videoPaths.length > 0) {
              await supabase.storage.from(VIDEO_BUCKET).remove(post.videoPaths);
            }
            const { error } = await supabase.from('posts').delete().eq('id', post.listing.id);
            if (error) throw error;

            setPosts((prev) => prev.filter((p) => p.listing.id !== post.listing.id));
          } catch {
            Alert.alert('Suppression impossible', "L'annonce n'a pas pu être supprimée. Réessaie dans un instant.");
          }
        },
      },
    ]);
  };

  // Suppression de compte (obligatoire pour la conformité App Store,
  // règle 5.1.1(v) : toute app qui permet de créer un compte doit aussi
  // permettre de le supprimer). Nettoie d'abord le storage (photos/vidéos
  // des annonces, même logique que handleDelete ci-dessus) puis appelle la
  // fonction Postgres `delete_own_account` — voir le SQL fourni séparément,
  // à exécuter dans Supabase avant que ce bouton fonctionne. Cette fonction
  // supprime aussi les annonces/discussions/messages/likes/jeton push liés,
  // et enfin la ligne `auth.users` elle-même.
  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer définitivement ton compte ?',
      'Tes annonces, favoris, discussions et messages seront supprimés. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer mon compte',
          style: 'destructive',
          onPress: async () => {
            setDeletingAccount(true);

            // Nettoyage du storage : best-effort, jamais bloquant. Avant ce
            // correctif, une erreur ici (fichier déjà absent, hoquet réseau,
            // etc.) faisait échouer TOUTE la suppression — y compris la
            // ligne RPC pourtant critique — laissant le compte intact et
            // l'utilisateur toujours connecté sans suppression réelle.
            try {
              const photoPaths = posts.flatMap((p) => p.photoPaths);
              const videoPaths = posts.flatMap((p) => p.videoPaths);
              if (photoPaths.length > 0) await supabase.storage.from(PHOTO_BUCKET).remove(photoPaths);
              if (videoPaths.length > 0) await supabase.storage.from(VIDEO_BUCKET).remove(videoPaths);
            } catch (err) {
              console.warn('[handleDeleteAccount] échec nettoyage storage (non bloquant):', err);
            }

            try {
              const { error } = await supabase.rpc('delete_own_account');
              if (error) throw error;

              await supabase.auth.signOut();
              router.replace('/(tabs)/(home)');
            } catch (err) {
              setDeletingAccount(false);
              const detail = err instanceof Error ? err.message : String(err);
              Alert.alert('Suppression impossible', `Le compte n'a pas pu être supprimé. ${detail}`);
            }
          },
        },
      ]
    );
  };

  if (isLoggedIn === null || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoggedIn === false || !user) {
    return <SignInRequired redirect="/(tabs)/profile" message="Connecte-toi pour voir ton profil et tes annonces." />;
  }

  return (
    // Redesign v2 : plus de header global (voir (tabs)/_layout.tsx) — la
    // zone de sécurité du haut doit être gérée ici, sinon la carte profil
    // démarre sous l'encoche/la barre de statut.
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center gap-3 rounded-[22px] bg-card p-5 shadow-sm shadow-black/5">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-tint">
          <MaterialCommunityIcons name="account-outline" size={30} color={colors.tintForeground} />
        </View>
        <View className="items-center gap-0.5">
          <Text style={{ fontFamily: FONT_DISPLAY_BOLD }} className="text-[22px] tracking-tight text-foreground">
            {user.fullName}
          </Text>
          <Text className="text-sm text-muted-foreground">{user.email}</Text>
        </View>
        <Pressable onPress={handleSignOut} hitSlop={8} className="mt-1 rounded-full bg-secondary px-4 py-2">
          <Text className="text-sm font-semibold text-foreground">Se déconnecter</Text>
        </Pressable>
      </View>

      <View className="gap-3">
        <Text className="text-base font-semibold text-foreground">Mes annonces</Text>

        {posts.length === 0 ? (
          <View className="items-center justify-center gap-2 rounded-[22px] bg-card py-16">
            <MaterialCommunityIcons name="home-outline" size={22} color={colors.mutedForeground} />
            <Text className="text-sm text-muted-foreground">Tu n&apos;as encore publié aucune annonce.</Text>
          </View>
        ) : (
          posts.map((post) => (
            <MyPostCard
              key={post.listing.id}
              post={post}
              onEdit={() => handleEdit(post)}
              onDelete={() => handleDelete(post)}
            />
          ))
        )}
      </View>

      {/* Suppression de compte — exigée par l'App Store (règle 5.1.1(v)),
          volontairement discrète (texte simple, pas un bouton plein) : c'est
          une action rare et irréversible, pas une action courante. */}
      <View className="gap-1 rounded-[22px] bg-card px-4 py-1 shadow-sm shadow-black/5">
        <Pressable
          onPress={handleDeleteAccount}
          disabled={deletingAccount}
          hitSlop={8}
          className="flex-row items-center justify-between py-3.5"
        >
          <Text className="text-sm font-medium text-destructive">Supprimer mon compte</Text>
          {deletingAccount && <ActivityIndicator size="small" color={colors.destructive} />}
        </Pressable>
      </View>
    </ScrollView>
  );
}
