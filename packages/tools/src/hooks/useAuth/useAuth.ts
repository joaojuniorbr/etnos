'use client';

import { useState } from 'react';
import {
	signOut,
	sendPasswordResetEmail,
	User,
	createUserWithEmailAndPassword,
	signInWithPopup,
} from 'firebase/auth';
import { message } from 'antd';
import { authFirebase, errorMessage, googleProvider, api } from '@etnos/tools';
import { useQuery } from '@tanstack/react-query';

const KEY_AUTH = 'etnos_auth_token';

export interface UserProfileInterface extends User {
	id?: string;
	parentName?: string;
	childName?: string;
	childBirthDate?: string;
	parentPhone?: string;
	school?: string;
	updatedAt?: string;
	role?: string[];
}

const userRepo: any = {
	update: async (uid: string, data: Partial<UserProfileInterface>) =>
		console.log('Updating user', uid, data),
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

	const loginWithGoogle = async () => {
		try {
			const result = await signInWithPopup(authFirebase, googleProvider);

			const idToken = await result.user.getIdTokenResult();

			saveToken(idToken.token);

			return result.user;
		} catch (error) {
			message.error(errorMessage(error));
			return null;
		}
	};

	const onSignOut = async () => {
		setIsLoading(true);
		try {
			await signOut(authFirebase);
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
			await sendPasswordResetEmail(authFirebase, email);
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
			const userCredential = await createUserWithEmailAndPassword(
				authFirebase,
				values.parentEmail,
				values.password
			);

			const newUser = userCredential.user;

			await userRepo.update(newUser.uid, {
				school: values.school,
				parentName: values.parentName,
				email: values.parentEmail,
				phone: values.parentPhone,
				childName: values.childName,
				childBirthDate: values.childBirthDate,
			} as any);

			return newUser;
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
