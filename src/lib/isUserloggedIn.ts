import { supabase } from "./supabase";

export async function isLoggedIn() {
    const { data, error } = await supabase.auth.getUser();
    // Renvoie true si un utilisateur existe, sinon false
    if (error || !data.user) {
      // Si l'utilisateur n'existe plus côté serveur, on nettoie la session locale
      await supabase.auth.signOut();
      return false;
    }
    return !!data.user; 
}
