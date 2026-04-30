import type { AxiosInstance } from 'axios';
import type {
  RegisterPushTokenPayload,
  UnregisterPushTokenPayload,
} from '@etnos/types';

export const createNotificationsService = (api: AxiosInstance) => ({
  registerPushToken(payload: RegisterPushTokenPayload): Promise<{ ok: boolean }> {
    return api
      .post('/notifications/push-token', payload)
      .then((response) => response.data);
  },

  unregisterPushToken(
    payload?: UnregisterPushTokenPayload,
  ): Promise<{ ok: boolean }> {
    return api
      .delete('/notifications/push-token', payload ? { data: payload } : undefined)
      .then((response) => response.data);
  },
});
