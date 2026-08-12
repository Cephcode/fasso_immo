type Listener = (discussionId: string) => void;

const listeners = new Set<Listener>();

/**
 * Petit pub/sub en mémoire pour propager l'arrivée d'un nouveau message
 * (détecté via la notification push reçue) aux écrans montés qui doivent se
 * rafraîchir — sans dépendre d'un abonnement Supabase Realtime.
 */
export function onNewMessage(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitNewMessage(discussionId: string) {
  listeners.forEach((listener) => listener(discussionId));
}
