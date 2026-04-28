import type { AxiosInstance } from 'axios';
import type { RegisterPushTokenPayload } from '@etnos/types';

export const createNotificationsService = (api: AxiosInstance) => ({
  registerPushToken(payload: RegisterPushTokenPayload): Promise<{ ok: boolean }> {
    return api
      .post('/notifications/push-token', payload)
      .then((response) => response.data);
  },
});
