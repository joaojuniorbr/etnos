'use client';

import { useEffect, useState } from 'react';
import {
	signOut,
	signInWithEmailAndPassword,
	sendPasswordResetEmail,
	User,
	onAuthStateChanged,
	createUserWithEmailAndPassword,
	signInWithPopup,
} from 'firebase/auth';
import { message } from 'antd';
import {
	authFirebase,
	errorMessage,
	googleProvider,
	firestoreAdapter as fs,
	FirestoreRepository,
} from '@etnos/tools';

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

const userRepo = new FirestoreRepository<UserProfileInterface>('users');

export const useAuth = () => {
	const [user, setUser] = useState<UserProfileInterface | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const isLoggedIn = !!user;

	const cleanDataForFirestore = (data: any) => {
		return Object.keys(data).reduce((acc: any, key) => {
			acc[key] = data[key] === undefined ? null : data[key];
			return acc;
		}, {});
	};

	const getProfile = async (firebaseUser: User) => {
		try {
			const userProfile = await userRepo.findOne({
				where: [fs.where('__name__', '==', firebaseUser.uid)],
			});

			if (userProfile) {
				setUser({ ...firebaseUser, ...userProfile } as UserProfileInterface);
			} else {
				setUser(firebaseUser as UserProfileInterface);
			}
		} catch (error) {
			errorMessage(error);
		} finally {
			setIsLoading(false);
		}
	};

	const onSignInWithEmailAndPassword = async (
		email: string,
		password: string
	) => {
		setIsLoading(true);
		try {
			const result = await signInWithEmailAndPassword(
				authFirebase,
				email,
				password
			);
			return result.user;
		} catch (error) {
			errorMessage(error);
			setIsLoading(false);
			return null;
		}
	};

	const onSignOut = async () => {
		setIsLoading(true);
		try {
			await signOut(authFirebase);
			setUser(null);
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
		if (!user) return message.error('Nenhum usuário autenticado.');

		try {
			const dataToSave = {
				...cleanDataForFirestore(profile),
				updatedAt: fs.serverTimestamp(),
			};

			await userRepo.update(user.uid, dataToSave);

			setUser((prev) => (prev ? { ...prev, ...profile } : null));
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

	const loginWithGoogle = async () => {
		try {
			const result = await signInWithPopup(authFirebase, googleProvider);

			return result.user;
		} catch (error) {
			message.error(errorMessage(error));
			return null;
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(authFirebase, (firebaseUser) => {
			if (firebaseUser) {
				getProfile(firebaseUser);
			} else {
				setUser(null);
				setIsLoading(false);
			}
		});
		return () => unsubscribe();
	}, []);

	return {
		isLoading,
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
