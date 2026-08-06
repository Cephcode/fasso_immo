import type { DiscussionListItem, DiscussionMessage } from '@/lib/discussions';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

/** Liste des discussions de l'utilisateur connecté, façon boîte de réception WhatsApp. */
export function useDiscussions() {
  const [discussions, setDiscussions] = useState<DiscussionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setDiscussions([]);
      setLoading(false);
      return;
    }

    const { data: discussionRows, error: discussionsError } = await supabase
      .from('discussions')
      .select('id, created_at, user1_id, user2_id, post_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (discussionsError) {
      setError(discussionsError.message);
      setLoading(false);
      return;
    }

    const discussionIds = (discussionRows ?? []).map((d) => d.id);

    if (discussionIds.length === 0) {
      setDiscussions([]);
      setLoading(false);
      return;
    }

    // Pas de vue SQL dédiée : on récupère tous les messages des discussions
    // concernées et on calcule "dernier message" / "non lus" côté client.
    // Suffisant pour le volume attendu d'une messagerie non temps réel.
    const { data: messageRows, error: messagesError } = await supabase
      .from('messages')
      .select('id, created_at, discussion_id, content, is_read, sender_id')
      .in('discussion_id', discussionIds)
      .order('created_at', { ascending: false });

    if (messagesError) {
      setError(messagesError.message);
      setLoading(false);
      return;
    }

    const lastMessageByDiscussion = new Map<string, (typeof messageRows)[number]>();
    const unreadCountByDiscussion = new Map<string, number>();

    for (const message of messageRows ?? []) {
      if (!lastMessageByDiscussion.has(message.discussion_id)) {
        lastMessageByDiscussion.set(message.discussion_id, message);
      }
      if (message.sender_id !== user.id && !message.is_read) {
        unreadCountByDiscussion.set(message.discussion_id, (unreadCountByDiscussion.get(message.discussion_id) ?? 0) + 1);
      }
    }

    const postIds = Array.from(
      new Set((discussionRows ?? []).map((d) => d.post_id).filter((id): id is string => Boolean(id)))
    );

    const postsById = new Map<string, DiscussionListItem['post']>();
    if (postIds.length > 0) {
      const { data: postRows } = await supabase.from('posts').select('id, title, photos_id').in('id', postIds);
      for (const post of postRows ?? []) {
        postsById.set(post.id, {
          id: post.id,
          title: post.title,
          coverPhotoUrl: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${Object.values(post.photos_id ?? {})[0] ?? ''}`,
        });
      }
    }

    const items: DiscussionListItem[] = (discussionRows ?? []).map((discussion) => {
      const lastMessageRow = lastMessageByDiscussion.get(discussion.id);
      const lastMessage: DiscussionMessage | null = lastMessageRow
        ? {
            id: lastMessageRow.id,
            createdAt: lastMessageRow.created_at,
            content: lastMessageRow.content,
            senderId: lastMessageRow.sender_id,
            isRead: lastMessageRow.is_read,
          }
        : null;

      return {
        id: discussion.id,
        createdAt: discussion.created_at,
        otherUserId: discussion.user1_id === user.id ? discussion.user2_id : discussion.user1_id,
        lastMessage,
        unreadCount: unreadCountByDiscussion.get(discussion.id) ?? 0,
        post: discussion.post_id ? postsById.get(discussion.post_id) ?? null : null,
      };
    });

    items.sort((a, b) => {
      const aTime = new Date(a.lastMessage?.createdAt ?? a.createdAt).getTime();
      const bTime = new Date(b.lastMessage?.createdAt ?? b.createdAt).getTime();
      return bTime - aTime;
    });

    setDiscussions(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { discussions, loading, error, refresh: load };
}
