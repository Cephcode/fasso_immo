import { likePost, unlikePost } from '@/lib/likes';
import { supabase } from '@/lib/supabase';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type LikedPostsContextValue = {
  likedIds: Set<string>;
  isLiked: (postId: string) => boolean;
  toggleLike: (postId: string) => Promise<void>;
  loading: boolean;
};

const LikedPostsContext = createContext<LikedPostsContextValue | null>(null);

/**
 * Source de vérité unique des annonces likées par l'utilisateur connecté :
 * les cœurs de la liste, de la fiche annonce et de l'onglet Favoris restent
 * synchronisés entre eux sans requête dupliquée.
 */
export function LikedPostsProvider({ children }: { children: ReactNode }) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLikedIds(new Set());
      setLoading(false);
      return;
    }

    const { data } = await supabase.from('likes').select('post_id').eq('user_id', user.id);
    setLikedIds(new Set((data ?? []).map((row) => row.post_id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setLikedIds(new Set());
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        load();
      }
    });

    return () => subscription.unsubscribe();
  }, [load]);

  const toggleLike = useCallback(async (postId: string) => {
    const wasLiked = likedIds.has(postId);

    setLikedIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });

    try {
      if (wasLiked) await unlikePost(postId);
      else await likePost(postId);
    } catch {
      // Échec réseau/permission : on annule l'optimisme silencieusement, le
      // cœur revient à son état précédent au prochain rendu.
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(postId);
        else next.delete(postId);
        return next;
      });
    }
  }, [likedIds]);

  const isLiked = useCallback((postId: string) => likedIds.has(postId), [likedIds]);

  return (
    <LikedPostsContext.Provider value={{ likedIds, isLiked, toggleLike, loading }}>
      {children}
    </LikedPostsContext.Provider>
  );
}

export function useLikedPosts() {
  const ctx = useContext(LikedPostsContext);
  if (!ctx) throw new Error('useLikedPosts doit être utilisé sous LikedPostsProvider.');
  return ctx;
}
