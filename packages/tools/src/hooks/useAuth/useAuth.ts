'use client';

import { useEffect, useState } from 'react';
import { message } from 'antd';
import { errorMessage } from '../../helpers/errorMessage';
import { api } from '../../helpers/api';
import {
	AUTH_TOKEN_STORAGE_KEY,
	clearStoredAuthSession,
	saveStoredAuthSession,
	updateAuthActivity,
} from '../../helpers/authSession';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserProfileInterface } from '@etnos/types';

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const authFirebase = getAuth(app);
const googleProvider = new GoogleAuthProvider();
export const getStoredAuthToken = () => {
	if (globalThis.window === undefined) {
		return null;
	}

	return globalThis.window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
};

export const useAuth = () => {
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();
	const userQueryKey = ['profile'] as const;

	const {
		data: user,
		isLoading: isProfileLoading,
		refetch: refetchProfile,
	} = useQuery({
		queryKey: userQueryKey,
		queryFn: async () => {
			try {
				const profile = (await api
					.get(`/auth/profile`)
					.then((res) => res.data)) as UserProfileInterface;

				return profile;
			} catch (error) {
				errorMessage(error);
				return null;
			}
		},
		retry: 3,
		enabled: Boolean(getStoredAuthToken()),
	});

	const cleanDataForFirestore = (data: any) => {
		return Object.keys(data).reduce((acc: any, key) => {
			acc[key] = data[key] === undefined ? null : data[key];
			return acc;
		}, {});
	};

	useEffect(() => {
		if (globalThis.window === undefined || !getStoredAuthToken()) {
			return;
		}

		const events = ['pointerdown', 'keydown', 'scroll', 'visibilitychange'];
		const handleActivity = () => {
			if (document.visibilityState === 'hidden') {
				return;
			}

			updateAuthActivity();
		};

		events.forEach((eventName) => {
			if (eventName === 'visibilitychange') {
				document.addEventListener(eventName, handleActivity, {
					passive: true,
				});
				return;
			}

			globalThis.window.addEventListener(eventName, handleActivity, {
				passive: true,
			});
		});

		return () => {
			events.forEach((eventName) => {
				if (eventName === 'visibilitychange') {
					document.removeEventListener(eventName, handleActivity);
					return;
				}

				globalThis.window.removeEventListener(eventName, handleActivity);
			});
		};
	}, [user]);

	const onSignInWithEmailAndPassword = async (
		email: string,
		password: string
	) => {
		setIsLoading(true);
		return api
			.post('/auth/login', { email, password })
			.then((res) => {
				const { idToken, refreshToken, expiresIn } = res.data;

				saveStoredAuthSession({ idToken, refreshToken, expiresIn });

				setIsLoading(false);

				return res.data.user;
			})
			.catch(() => {
				setIsLoading(false);
				return null;
			});
	};

	const loginWithGoogle = async (): Promise<UserProfileInterface | null> => {
		setIsLoading(true);
		try {
			const result = await signInWithPopup(authFirebase, googleProvider);
			const firebaseIdToken = await result.user.getIdToken(true);
			const tokenResult = await result.user.getIdTokenResult();
			const response = await api.post('/auth/google', {
				idToken: firebaseIdToken,
			});
			const { idToken, user } = response.data;
			const expirationTime = tokenResult.expirationTime
				? new Date(tokenResult.expirationTime).getTime()
				: null;
			const expiresIn = expirationTime
				? Math.max(
						Math.floor((expirationTime - Date.now()) / 1000),
						0
				  )
				: undefined;

			saveStoredAuthSession({
				idToken,
				refreshToken: result.user.refreshToken,
				expiresIn,
			});

			return user;
		} catch {
			message.error('Login com Google indisponível no momento.');
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const onSignOut = async () => {
		setIsLoading(true);
		try {
			clearStoredAuthSession();
			queryClient.setQueryData(userQueryKey, null);
			message.success('Desconectado com sucesso!');
		} catch (error) {
			message.error(errorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	const onRecoveryPass = async (email: string) => {
		setIsLoading(true);
		try {
			await api.post('/auth/recovery', { email });
			message.success('E-mail de recuperação enviado!');
		} catch (error) {
			message.error(errorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	const updateUserProfile = async (profile: Partial<UserProfileInterface>) => {
		try {
			const dataToSave = cleanDataForFirestore(profile);

			await api.post('/auth/profile', dataToSave);

			refetchProfile();
			message.success('Perfil atualizado!');
		} catch (error) {
			message.error(errorMessage(error, 'Erro ao salvar perfil.'));
		}
	};

	const onRegister = async (values: any) => {
		setIsLoading(true);
		try {
			const response = await api.post('/auth/register', {
				email: values.parentEmail,
				password: values.password,
				school: values.school,
				parentName: values.parentName,
				parentPhone: values.parentPhone,
				childName: values.childName,
				childBirthDate: values.childBirthDate,
			});

			const { idToken, user } = response.data;

			saveStoredAuthSession({
				idToken,
				refreshToken: response.data.refreshToken,
				expiresIn: response.data.expiresIn,
			});

			return user;
		} catch (error) {
			message.error(errorMessage(error));
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const isLoggedIn = !!user;

	return {
		isLoading,
		isProfileLoading,
		user,
		isLoggedIn,
		updateUserProfile,
		onRegister,
		onSignOut,
		onSignInWithEmailAndPassword,
		onRecoveryPass,
		loginWithGoogle,
	};
};
