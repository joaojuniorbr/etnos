import { useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { Platform } from 'react-native';
import type { UserProfileInterface } from '@etnos/types';

import { notificationsService } from '@/utils';

const getProjectId = (): string | null =>
	process.env.EXPO_PUBLIC_PROJECT_ID ?? null;

const normalizeHref = (value: unknown): Href | null => {
	if (typeof value !== 'string' || !value.trim()) {
		return null;
	}

	const route = value.trim();

	if (route.startsWith('/')) {
		return route as Href;
	}

	return `/${route}` as Href;
};

const getNotificationHref = (
	response: Notifications.NotificationResponse,
): Href | null => {
	const data = response.notification.request.content.data ?? {};

	return (
		normalizeHref(data.deeplink) ??
		normalizeHref(data.route) ??
		normalizeHref(data.screen)
	);
};

const handleNotificationResponse = (
	response: Notifications.NotificationResponse | null,
) => {
	if (!response) {
		return;
	}

	const href = getNotificationHref(response);

	if (href) {
		router.push(href);
	}
};

export const usePushNotifications = (user: UserProfileInterface | null) => {
	const registeredUserIdRef = useRef<string | null>(null);
	const disabledSyncedUserIdRef = useRef<string | null>(null);
	const notificationsEnabled = user?.notificationsEnabled !== false;

	const registerPushToken = useCallback(async (userId: string) => {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		const finalStatus =
			existingStatus === 'granted'
				? existingStatus
				: (await Notifications.requestPermissionsAsync()).status;

		if (finalStatus !== 'granted') {
			throw new Error('notification-permission-denied');
		}

		if (Platform.OS === 'android') {
			await Notifications.setNotificationChannelAsync('default', {
				name: 'default',
				importance: Notifications.AndroidImportance.MAX,
			});
		}

		const projectId = getProjectId();

		if (!projectId) {
			throw new Error('missing-expo-project-id');
		}

		const token = await Notifications.getExpoPushTokenAsync({ projectId });

		await notificationsService.registerPushToken({
			token: token.data,
			platform: Platform.OS,
		});

		registeredUserIdRef.current = userId;
		disabledSyncedUserIdRef.current = null;
		return token.data;
	}, []);

	const unregisterPushToken = useCallback(async (userId?: string) => {
		await notificationsService.unregisterPushToken();
		registeredUserIdRef.current = null;
		disabledSyncedUserIdRef.current = userId ?? null;
	}, []);

	useEffect(() => {
		const subscription = Notifications.addNotificationResponseReceivedListener(
			handleNotificationResponse,
		);

		handleNotificationResponse(Notifications.getLastNotificationResponse());

		return () => {
			subscription.remove();
		};
	}, []);

	useEffect(() => {
		const userId = user?.id;

		if (
			!notificationsEnabled ||
			!userId ||
			registeredUserIdRef.current === userId
		) {
			return;
		}

		let isMounted = true;

		const registerAuthenticatedUser = async () => {
			try {
				await registerPushToken(userId);
			} catch {
				if (isMounted) {
					registeredUserIdRef.current = null;
				}
			}
		};

		void registerAuthenticatedUser();

		return () => {
			isMounted = false;
		};
	}, [notificationsEnabled, registerPushToken, user?.id]);

	useEffect(() => {
		const userId = user?.id;

		if (
			notificationsEnabled ||
			!userId ||
			disabledSyncedUserIdRef.current === userId
		) {
			return;
		}

		void unregisterPushToken(userId).catch(() => {
			disabledSyncedUserIdRef.current = null;
		});
	}, [notificationsEnabled, unregisterPushToken, user?.id]);

	return {
		ensurePushTokenRegistered: async () => {
			if (!user?.id) return null;
			return registerPushToken(user.id);
		},
		ensurePushTokenUnregistered: async () => {
			if (!user?.id) return;
			await unregisterPushToken(user.id);
		},
	};
};
