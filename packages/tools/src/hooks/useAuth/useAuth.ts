'use client';

import { useState } from 'react';
import { message } from 'antd';
import { errorMessage } from '../../helpers/errorMessage';
import { api } from '../../helpers/api';
import { useQuery } from '@tanstack/react-query';
import type { UserProfileInterface } from '@etnos/types';

const KEY_AUTH = 'etnos_auth_token';

const userRepo: any = {
	update: async (uid: string, data: Partial<UserProfileInterface>) => ({
		...data,
		uid,
	}),
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

	const loginWithGoogle = async (): Promise<UserProfileInterface | null> => {
		message.error('Login com Google indisponível no momento.');
		return null;
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

			await userRepo.update(user.uid, {
				school: values.school,
				parentName: values.parentName,
				email: values.parentEmail,
				phone: values.parentPhone,
				childName: values.childName,
				childBirthDate: values.childBirthDate,
			} as any);

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
