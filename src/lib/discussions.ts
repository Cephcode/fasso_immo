import { supabase } from '@/lib/supabase';

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

export type DiscussionMessage = {
  id: string;
  createdAt: string;
  content: string;
  senderId: string;
  isRead: boolean;
};

export type DiscussionPostPreview = {
  id: string;
  title: string;
  coverPhotoUrl: string;
};

export type DiscussionListItem = {
  id: string;
  createdAt: string;
  otherUserId: string;
  lastMessage: DiscussionMessage | null;
  unreadCount: number;
  post: DiscussionPostPreview | null;
};

/**
 * Retrouve la discussion existante entre l'utilisateur connecté, `otherUserId`
 * et l'annonce `postId`, ou en crée une nouvelle. Sert de point d'entrée
 * depuis la fiche annonce ("Message" → discussion avec le propriétaire).
 *
 * Scopée par annonce : contacter le même vendeur depuis deux annonces
 * différentes ouvre deux discussions distinctes, chacune rattachée à son
 * annonce (titre affiché, `related_post_id` sur les messages).
 */
export async function getOrCreateDiscussion(otherUserId: string, postId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Vous devez être connecté pour envoyer un message.');
  if (user.id === otherUserId) throw new Error('Vous ne pouvez pas vous envoyer un message à vous-même.');

  const { data: existing, error: findError } = await supabase
    .from('discussions')
    .select('id')
    .eq('post_id', postId)
    .or(
      `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
    )
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing.id as string;

  const { data: created, error: createError } = await supabase
    .from('discussions')
    .insert({ user1_id: user.id, user2_id: otherUserId, post_id: postId })
    .select('id')
    .single();

  if (createError) throw createError;
  return created.id as string;
}

/**
 * Notification "push" envoyée directement depuis le téléphone de
 * l'expéditeur vers l'API Expo Push, sans serveur intermédiaire — la version
 * la plus simple possible pour une messagerie non temps réel. Le jeton du
 * destinataire est lu dans `push_tokens` (voir usePushRegistration.ts). Un
 * échec ici ne doit jamais empêcher l'envoi du message lui-même.
 */
export async function notifyNewMessage(recipientId: string, body: string, discussionId: string) {
  try {
    // `.limit(1)` plutôt que `.maybeSingle()` : si d'anciens doublons
    // traînent encore en base (avant le passage à delete+insert dans
    // usePushRegistration.ts), `.maybeSingle()` renvoie une erreur sur
    // plusieurs lignes et on ne préviendrait plus jamais le destinataire.
    const { data } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', recipientId)
      .order('updated_at', { ascending: false })
      .limit(1);
    const token = data?.[0]?.token;
    if (!token) return;

    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        to: token,
        title: 'Nouveau message',
        body,
        sound: 'default',
        data: { discussionId },
      }),
    });

    // L'API Expo Push répond 200 même en cas d'échec de relais vers FCM :
    // l'erreur est dans le "ticket" du corps de la réponse, pas le status HTTP.
    const result = await response.json();
    const ticket = result?.data;
    if (!response.ok || ticket?.status === 'error') {
      console.warn('[notifyNewMessage] Expo push ticket error:', ticket ?? result);
    }
  } catch (error) {
    // Bonus non bloquant : une erreur ici ne doit pas empêcher l'envoi du
    // message, mais on la log pour pouvoir diagnostiquer.
    console.warn('[notifyNewMessage] failed:', error);
  }
}
