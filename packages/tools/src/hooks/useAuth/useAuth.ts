'use client';

import { useState } from 'react';
import { message } from 'antd';
import { errorMessage } from '../../helpers/errorMessage';
import { api } from '../../helpers/api';
import { useQuery } from '@tanstack/react-query';
import type { UserProfileInterface } from '@etnos/types';

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const KEY_AUTH = 'etnos_auth_token';

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
const getStoredAuthToken = () => {
	if (typeof window === 'undefined') {
		return null;
	}

	return localStorage.getItem(KEY_AUTH);
};

export const useAuth = () => {
	const [isLoading, setIsLoading] = useState(false);

	const {
		data: user,
		isLoading: isProfileLoading,
		refetch: refetchProfile,
	} = useQuery({
		queryKey: ['profile'],
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

	const saveToken = (token: string) => localStorage.setItem(KEY_AUTH, token);

	const onSignInWithEmailAndPassword = async (
		email: string,
		password: string
	) => {
		setIsLoading(true);
		return api
			.post('/auth/login', { email, password })
			.then((res) => {
				const { idToken } = res.data;

				saveToken(idToken);

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
			const response = await api.post('/auth/google', {
				idToken: firebaseIdToken,
			});
			const { idToken, user } = response.data;

			saveToken(idToken);

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
			localStorage.removeItem(KEY_AUTH);
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

			saveToken(idToken);

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
