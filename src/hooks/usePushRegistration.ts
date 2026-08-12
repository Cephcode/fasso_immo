import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Enregistre le jeton Expo Push de l'appareil dans `push_tokens` dès que
 * l'utilisateur est connecté, pour que d'autres utilisateurs puissent lui
 * envoyer une notification (voir notifyNewMessage dans lib/discussions.ts).
 * `enabled` doit rester `false` tant qu'on ne sait pas si l'utilisateur est
 * connecté, pour ne pas demander la permission trop tôt.
 */
export function usePushRegistration(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !Device.isDevice) return;

    let cancelled = false;

    async function register() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted' || cancelled) return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      // upsert sur `user_id` (clé primaire de la table, confirmée par le
      // 42P10 obtenu en testant onConflict: 'token' — aucune contrainte
      // unique n'existe sur cette colonne). Un delete-puis-insert échouait
      // ici (23505 sur push_tokens_pkey) quand l'effet se déclenchait deux
      // fois en concurrence (ex: remount en dev) : les deux delete passaient
      // avant que l'un des deux insert ne s'exécute. L'upsert est atomique
      // et absorbe ce cas en mettant simplement à jour la ligne existante.
      const { error: upsertError } = await supabase
        .from('push_tokens')
        .upsert({ user_id: user.id, token, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (upsertError) console.warn('[usePushRegistration] upsert failed:', upsertError);
    }

    register().catch((error) => {
      // L'enregistrement du jeton est un bonus : une erreur ici ne doit pas
      // empêcher l'utilisation de l'app, mais on la log pour diagnostiquer
      // (ex: getExpoPushTokenAsync qui échoue si Firebase n'est pas
      // correctement initialisé côté natif).
      console.warn('[usePushRegistration] failed:', error);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);
}
