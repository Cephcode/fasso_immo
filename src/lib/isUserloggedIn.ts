import { supabase } from "./supabase";

export async function isLoggedIn() {
    const { data, error } = await supabase.auth.getUser();
    // Renvoie true si un utilisateur existe, sinon false
    return !!data.user; 
}
