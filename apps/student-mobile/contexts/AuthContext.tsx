import { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UserProfileInterface } from '@etnos/types';
import { authService, sessionStorage } from '@/utils';
import { usePushNotifications } from '@/hooks/usePushNotifications';

type AuthContextValue = {
	isAuthenticated: boolean;
	isHydrated: boolean;
	isLoading: boolean;
	isSyncingPushToken: boolean;
	isUpdatingNotifications: boolean;
	notificationsEnabled: boolean;
	user: UserProfileInterface | null;
	setNotificationsEnabled: (enabled: boolean) => Promise<void>;
	syncPushToken: () => Promise<void>;
	signIn: (email: string, password: string) => Promise<UserProfileInterface>;
	signOut: () => Promise<void>;
	refreshProfile: () => Promise<UserProfileInterface | null>;
	updateProfile: (
		payload: Partial<UserProfileInterface>,
	) => Promise<UserProfileInterface>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const queryClient = useQueryClient();
	const [user, setUser] = useState<UserProfileInterface | null>(null);
	const [isHydrated, setIsHydrated] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isSyncingPushToken, setIsSyncingPushToken] = useState(false);
	const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

	const { ensurePushTokenRegistered, ensurePushTokenUnregistered } =
		usePushNotifications(user);

	useEffect(() => {
		let isMounted = true;

		const bootstrap = async () => {
			try {
				const token = await sessionStorage.resolveValidStoredAuthToken(
					process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
				);

				if (!token) {
					if (isMounted) {
						setUser(null);
					}
					return;
				}

				const profile = await authService.getProfile();

				if (isMounted) {
					setUser(profile);
				}
			} catch {
				await sessionStorage.clearStoredAuthSession();

				if (isMounted) {
					setUser(null);
				}
			} finally {
				if (isMounted) {
					setIsHydrated(true);
				}
			}
		};

		void bootstrap();

		return () => {
			isMounted = false;
		};
	}, []);

	const signIn = async (email: string, password: string) => {
		setIsLoading(true);

		try {
			const response = await authService.login({ email, password });

			await sessionStorage.saveStoredAuthSession({
				idToken: response.idToken,
				refreshToken: response.refreshToken,
				expiresIn: response.expiresIn,
			});

			setUser(response.user);
			return response.user;
		} finally {
			setIsLoading(false);
			setIsHydrated(true);
		}
	};

	const signOut = async () => {
		setIsLoading(true);

		try {
			await sessionStorage.clearStoredAuthSession();
			queryClient.clear();
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	const refreshProfile = async () => {
		try {
			const profile = await authService.getProfile();
			setUser(profile);
			return profile;
		} catch {
			return null;
		}
	};

	const updateProfile = async (payload: Partial<UserProfileInterface>) => {
		setIsLoading(true);

		try {
			const profile = await authService.updateProfile(payload);
			setUser(profile);
			await queryClient.invalidateQueries();
			return profile;
		} finally {
			setIsLoading(false);
		}
	};

	const setNotificationsEnabled = async (enabled: boolean) => {
		setIsUpdatingNotifications(true);

		try {
			if (enabled) {
				await ensurePushTokenRegistered();
			}

			const profile = await authService.updateProfile({
				notificationsEnabled: enabled,
			});
			setUser(profile);

			if (!enabled) {
				await ensurePushTokenUnregistered();
				setUser({
					...profile,
					expoPushToken: null,
					hasPushToken: false,
				});
			}
			await queryClient.invalidateQueries();
		} finally {
			setIsUpdatingNotifications(false);
		}
	};

	const syncPushToken = async () => {
		setIsSyncingPushToken(true);

		try {
			await ensurePushTokenRegistered();
			const profile = await authService.getProfile();
			setUser(profile);
			await queryClient.invalidateQueries();
		} finally {
			setIsSyncingPushToken(false);
		}
	};

	const value: AuthContextValue = {
		isAuthenticated: Boolean(user),
		isHydrated,
		isLoading,
		isSyncingPushToken,
		isUpdatingNotifications,
		notificationsEnabled: user?.notificationsEnabled !== false,
		refreshProfile,
		setNotificationsEnabled,
		signIn,
		signOut,
		syncPushToken,
		updateProfile,
		user,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used inside AuthProvider');
	}

	return context;
};
