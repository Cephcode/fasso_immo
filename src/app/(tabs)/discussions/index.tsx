import { Text } from '@/components/ui/text';
import { useDiscussions } from '@/hooks/useDiscussions';
import type { DiscussionListItem } from '@/lib/discussions';
import { formatDiscussionTimestamp } from '@/lib/format';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

function DiscussionRow({ item }: { item: DiscussionListItem }) {
  const colors = THEME.light;
  const hasUnread = item.unreadCount > 0;
  // "them" a écrit en dernier si l'expéditeur du dernier message n'est pas moi.
  const lastMessageIsMine = item.lastMessage != null && item.lastMessage.senderId !== item.otherUserId;
  const preview = item.lastMessage
    ? `${lastMessageIsMine ? 'Vous : ' : ''}${item.lastMessage.content}`
    : 'Démarrez la conversation';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/discussion/[id]', params: { id: item.id } })}
      className="flex-row items-center gap-3 px-4 py-3"
    >
      <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-secondary">
        {item.post ? (
          <Image
            source={{ uri: item.post.coverPhotoUrl }}
            contentFit="cover"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <MaterialCommunityIcons name="account-circle-outline" size={30} color={colors.mutedForeground} />
        )}
      </View>

      <View className="flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-[15px] font-semibold text-foreground">
          {item.post?.title ?? 'Discussion'}
        </Text>
        <Text
          numberOfLines={1}
          className={hasUnread ? 'text-sm font-medium text-foreground' : 'text-sm text-muted-foreground'}
        >
          {preview}
        </Text>
      </View>

      <View className="items-end gap-1.5">
        <Text className="text-xs text-muted-foreground">
          {item.lastMessage ? formatDiscussionTimestamp(item.lastMessage.createdAt) : ''}
        </Text>
        {hasUnread && (
          <View className="h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5">
            <Text className="text-[11px] font-bold text-primary-foreground">{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function DiscussionsScreen() {
  const colors = THEME.light;
  const { discussions, loading, error, refresh } = useDiscussions();

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-border px-4 pb-3 pt-4">
        <Text className="text-2xl font-bold tracking-tight text-foreground">Discussions</Text>
      </View>

      <FlashList
        data={discussions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DiscussionRow item={item} />}
        ItemSeparatorComponent={() => <View className="ml-[72px] h-px bg-border" />}
        refreshing={loading}
        onRefresh={refresh}
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-24">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View className="items-center justify-center gap-3 px-8 py-24">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <MaterialCommunityIcons name="message-text-outline" size={26} color={colors.primary} />
              </View>
              <Text className="text-lg font-semibold text-foreground">Aucune discussion</Text>
              <Text className="text-center text-sm text-muted-foreground">
                {error ?? 'Contactez un propriétaire depuis une annonce pour démarrer une conversation.'}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
