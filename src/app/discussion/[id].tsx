import { GlassBlurRoot, GlassSurface } from '@/components/ui/glass-view';
import { Text } from '@/components/ui/text';
import { useDiscussion } from '@/hooks/useDiscussion';
import type { DiscussionMessage } from '@/lib/discussions';
import { formatMessageDateSeparator, formatMessageTime } from '@/lib/format';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

type Row = { key: string } & ({ type: 'separator'; label: string } | { type: 'message'; message: DiscussionMessage });

function MessageBubble({ message, isMine }: { message: DiscussionMessage; isMine: boolean }) {
  return (
    <View className={isMine ? 'mb-2 items-end' : 'mb-2 items-start'}>
      <View
        className={
          isMine
            ? 'max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5'
            : 'max-w-[80%] rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2.5'
        }
      >
        <Text className={isMine ? 'text-[15px] text-primary-foreground' : 'text-[15px] text-foreground'}>
          {message.content}
        </Text>
      </View>
      <Text className="mt-1 px-1 text-[11px] text-muted-foreground">{formatMessageTime(message.createdAt)}</Text>
    </View>
  );
}

export default function DiscussionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = THEME.light;
  const insets = useSafeAreaInsets();
  const { messages, currentUserId, postTitle, loading, sending, error, sendMessage } = useDiscussion(id);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlashListRef<Row>>(null);

  // Remplace KeyboardAvoidingView : sous Android 15+/edge-to-edge,
  // `windowSoftInputMode="adjustResize"` et l'API `Keyboard` classique de
  // React Native ne rapportent plus fiablement la hauteur du clavier.
  // `useAnimatedKeyboard` lit directement les insets natifs et fonctionne
  // sur les deux plateformes.
  const keyboard = useAnimatedKeyboard();
  const keyboardAvoidingStyle = useAnimatedStyle(() => ({
    // La barre a déjà `paddingBottom: insets.bottom + 10` pour dégager la
    // zone de geste quand le clavier est fermé — on le retranche ici pour ne
    // pas laisser ce même espace vide entre la barre et le clavier une fois
    // ouvert (le clavier couvre déjà cette zone).
    transform: [{ translateY: -Math.max(keyboard.height.value - insets.bottom, 0) }],
  }));

  // Regroupe les messages par jour avec un séparateur, comme dans une
  // messagerie classique — pas de pagination/temps réel, juste le fil complet.
  const rows: Row[] = [];
  let lastDateKey = '';
  for (const message of messages) {
    const dateKey = message.createdAt.slice(0, 10);
    if (dateKey !== lastDateKey) {
      rows.push({ type: 'separator', label: formatMessageDateSeparator(message.createdAt), key: `sep-${dateKey}` });
      lastDateKey = dateKey;
    }
    rows.push({ type: 'message', message, key: message.id });
  }

  const handleSend = async () => {
    const content = draft;
    if (!content.trim() || sending) return;
    setDraft('');
    const sent = await sendMessage(content);
    if (!sent) {
      // Échec (ou discussion pas encore prête) : on rend le brouillon à
      // l'utilisateur au lieu de le faire disparaître silencieusement.
      setDraft(content);
      return;
    }
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  // Fil de messages : c'est le fond flouté par la barre de saisie fixée en
  // bas (voir la note sœur/descendante dans glass-view.tsx).
  const body = (
    <View className="flex-1">
      <View
        className="flex-row items-center gap-3 border-b border-border px-4 pb-3"
        style={{ paddingTop: insets.top + 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-secondary"
        >
          <MaterialCommunityIcons name="chevron-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text numberOfLines={1} className="flex-1 text-base font-semibold text-foreground">
          {postTitle ?? 'Discussion'}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlashList
          ref={listRef}
          data={rows}
          keyExtractor={(row) => row.key}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: insets.bottom + 84 }}
          renderItem={({ item }) =>
            item.type === 'separator' ? (
              <View className="items-center py-3">
                <Text className="overflow-hidden rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  {item.label}
                </Text>
              </View>
            ) : (
              <MessageBubble message={item.message} isMine={item.message.senderId === currentUserId} />
            )
          }
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}
    </View>
  );

  return (
    <View className="flex-1">
      <GlassBlurRoot className="flex-1 bg-background" background={body}>
        <Animated.View
          className="absolute bottom-0 left-0 right-0 px-3"
          style={[{ paddingBottom: insets.bottom + 10 }, keyboardAvoidingStyle]}
        >
          {error ? (
            <Text className="mb-2 px-1 text-center text-xs text-destructive">{error}</Text>
          ) : null}
          <GlassSurface intensity="thick" className="flex-row items-end gap-2 rounded-[26px] p-2">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Écrire un message..."
              placeholderTextColor={colors.mutedForegroundSecond}
              multiline
              className="max-h-24 flex-1 rounded-2xl bg-background/70 px-4 py-2.5 text-base text-foreground"
            />
            <Pressable
              onPress={handleSend}
              disabled={!draft.trim() || sending}
              className={
                draft.trim() && !sending
                  ? 'h-11 w-11 items-center justify-center rounded-full bg-primary'
                  : 'h-11 w-11 items-center justify-center rounded-full bg-primary/40'
              }
            >
              {sending ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <MaterialCommunityIcons name="send" size={18} color={colors.primaryForeground} />
              )}
            </Pressable>
          </GlassSurface>
        </Animated.View>
      </GlassBlurRoot>
    </View>
  );
}
