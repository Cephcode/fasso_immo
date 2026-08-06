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

      await supabase.from('push_tokens').upsert({ user_id: user.id, token, updated_at: new Date().toISOString() });
    }

    register().catch(() => {
      // L'enregistrement du jeton est un bonus : une erreur ici ne doit pas
      // empêcher l'utilisation de l'app.
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);
}
