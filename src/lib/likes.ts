import { supabase } from '@/lib/supabase';

export async function likePost(postId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Vous devez être connecté pour aimer une annonce.');

  const { error } = await supabase.from('likes').insert({ user_id: user.id, post_id: postId });
  if (error) throw error;
}

export async function unlikePost(postId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Vous devez être connecté pour aimer une annonce.');

  const { error } = await supabase.from('likes').delete().eq('user_id', user.id).eq('post_id', postId);
  if (error) throw error;
}
