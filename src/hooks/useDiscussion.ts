import type { DiscussionMessage } from '@/lib/discussions';
import { notifyNewMessage } from '@/lib/discussions';
import { onNewMessage } from '@/lib/messageEvents';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

/** Messages d'une discussion précise, avec envoi et notification du destinataire. */
export function useDiscussion(discussionId: string) {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }
    setCurrentUserId(user.id);

    const [{ data: discussion, error: discussionError }, { data: messageRows, error: messagesError }] =
      await Promise.all([
        supabase.from('discussions').select('user1_id, user2_id, post_id').eq('id', discussionId).single(),
        supabase
          .from('messages')
          .select('id, created_at, content, sender_id, is_read')
          .eq('discussion_id', discussionId)
          .order('created_at', { ascending: true }),
      ]);

    if (discussionError || messagesError) {
      setError(discussionError?.message ?? messagesError?.message ?? 'Erreur inconnue.');
      setLoading(false);
      return;
    }

    setOtherUserId(discussion.user1_id === user.id ? discussion.user2_id : discussion.user1_id);
    setPostId(discussion.post_id ?? null);

    if (discussion.post_id) {
      const { data: post } = await supabase.from('posts').select('title').eq('id', discussion.post_id).maybeSingle();
      setPostTitle(post?.title ?? null);
    } else {
      setPostTitle(null);
    }

    const mapped: DiscussionMessage[] = (messageRows ?? []).map((m) => ({
      id: m.id,
      createdAt: m.created_at,
      content: m.content,
      senderId: m.sender_id,
      isRead: m.is_read,
    }));
    setMessages(mapped);
    setLoading(false);

    const unreadIds = (messageRows ?? []).filter((m) => m.sender_id !== user.id && !m.is_read).map((m) => m.id);
    if (unreadIds.length > 0) {
      const { error: markReadError } = await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
      if (markReadError) {
        console.warn('[useDiscussion] failed to mark messages as read:', markReadError);
      } else {
        setMessages((prev) => prev.map((m) => (unreadIds.includes(m.id) ? { ...m, isRead: true } : m)));
      }
    }
  }, [discussionId]);

  useEffect(() => {
    load();
  }, [load]);

  // Sensation de temps réel : quand la notif push d'un nouveau message
  // arrive pour CETTE discussion, on recharge tant que l'écran est ouvert —
  // sans ça il faudrait quitter puis revenir pour voir le message.
  useEffect(() => {
    return onNewMessage((id) => {
      if (id === discussionId) load();
    });
  }, [discussionId, load]);

  const sendMessage = async (content: string): Promise<boolean> => {
    const trimmed = content.trim();
    if (!trimmed) return false;
    if (!currentUserId || !otherUserId) {
      setError("La discussion n'est pas encore prête, réessayez dans un instant.");
      return false;
    }

    setSending(true);
    setError(null);

    // Message affiché immédiatement (pas de temps réel côté serveur) puis
    // remplacé par la ligne réelle une fois l'insertion REST confirmée.
    const optimisticId = `optimistic-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: optimisticId, createdAt: new Date().toISOString(), content: trimmed, senderId: currentUserId, isRead: false },
    ]);

    const { data, error: insertError } = await supabase
      .from('messages')
      .insert({
        discussion_id: discussionId,
        content: trimmed,
        sender_id: currentUserId,
        is_read: false,
        related_post_id: postId,
      })
      .select('id, created_at')
      .single();

    setSending(false);

    if (insertError) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setError(insertError.message);
      return false;
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === optimisticId ? { ...m, id: data.id, createdAt: data.created_at } : m))
    );

    notifyNewMessage(otherUserId, trimmed, discussionId);
    return true;
  };

  return { messages, currentUserId, otherUserId, postTitle, loading, sending, error, sendMessage, refresh: load };
}
