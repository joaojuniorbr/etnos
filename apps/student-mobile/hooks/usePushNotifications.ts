import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from '@/utils';
import { createNotificationsService } from '@etnos/core';

const notificationsService = createNotificationsService(api);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

async function requestPermissionsAndGetToken(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

export function usePushNotifications(isAuthenticated: boolean) {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    const setup = async () => {
      try {
        const token = await requestPermissionsAndGetToken();

        if (!token || !isMounted) return;

        await notificationsService.registerPushToken({
          token,
          platform: Platform.OS,
        });
      } catch {
        // Ignora erros silenciosamente — push token é melhor-esforço
      }
    };

    void setup();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // Notificação recebida com app em foreground — handler global já exibe
      },
    );

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((_response) => {
        // Usuário tocou na notificação — adicione navegação aqui se necessário
      });

    return () => {
      isMounted = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);
}
