import { isLoggedIn as checkIsLoggedIn } from '@/lib/isUserloggedIn';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

/**
 * Source unique de vérité pour l'état de connexion Supabase, à réutiliser
 * partout où l'app doit savoir (et réagir en temps réel) si l'utilisateur
 * est authentifié — ex. jauger l'accès à l'onglet "Publier".
 *
 * `isLoggedIn` vaut `null` tant que la vérification initiale est en cours
 * (évite un flash "non connecté" au démarrage).
 */
export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Vérification initiale auprès de Supabase (nettoie aussi une
    // session locale devenue invalide, ex. compte supprimé côté serveur).
    checkIsLoggedIn().then((loggedIn) => {
      if (isMounted) setIsLoggedIn(loggedIn);
    });

    // 2. Écouteur en temps réel pour capturer connexion/déconnexion sans
    // avoir à recharger l'écran.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT' || !session) {
        setIsLoggedIn(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsLoggedIn(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isLoggedIn, checking: isLoggedIn === null };
}
