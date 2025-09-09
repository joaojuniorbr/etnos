'use client';

import { initializeApp } from 'firebase/app';
import {
	getAuth,
	signOut,
	signInWithEmailAndPassword,
	sendPasswordResetEmail,
	User,
	onAuthStateChanged,
	createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
	getFirestore,
	setDoc,
	doc,
	getDoc,
	serverTimestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { message } from 'antd';

export interface UserProfileInterface extends User {
	parentName?: string;
	childName?: string;
	childBirthDate?: string;
	parentPhone?: string;
	school?: string;
	updatedAt?: string;
}

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
export const dbFirebase = getFirestore(app);

export const authFirebase = getAuth(app);

export const useAuth = () => {
	const [user, setUser] = useState<UserProfileInterface | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const onSignOut = async () => {
		setIsLoading(true);
		try {
			await signOut(authFirebase);
			setUser(null);
		} catch (error) {
			console.error(error);
			setIsLoading(false);
		}
	};

	const onSignInWithEmailAndPassword = async (
		email: string,
		password: string
	): Promise<User | null> => {
		setIsLoading(true);
		try {
			const result = await signInWithEmailAndPassword(
				authFirebase,
				email,
				password
			);
			setUser(result.user as UserProfileInterface);
			setIsLoading(false);
			return result.user;
		} catch (error) {
			console.error(error);
			setIsLoading(false);
			return null;
		}
	};

	const onRecoveryPass = async (email: string) => {
		setIsLoading(true);
		try {
			await sendPasswordResetEmail(authFirebase, email);
			setIsLoading(false);
		} catch (error) {
			console.error(error);
			setIsLoading(false);
		}
	};

	const isLoggedIn = !!user;

	const cleanDataForFirestore = (data: object): object => {
		const cleanedData: { [key: string]: any } = {};
		for (const [key, value] of Object.entries(data)) {
			if (value !== undefined) {
				cleanedData[key] = value;
			} else {
				cleanedData[key] = null;
			}
		}
		return cleanedData;
	};

	const updateUserProfile = async (profile: any, merge: boolean = true) => {
		if (!user) {
			message.error('Nenhum usuário autenticado para atualizar o perfil.');
			return;
		}

		try {
			const userDocRef = doc(dbFirebase, 'users', user.uid);

			const dataToSave = {
				...cleanDataForFirestore(profile),
				updatedAt: serverTimestamp(),
			};

			await setDoc(userDocRef, dataToSave, { merge: merge });

			message.success('Perfil atualizado com sucesso!');

			setUser({ ...user, ...profile });
		} catch (error) {
			console.log({ error });
			message.error('Ocorreu um erro ao salvar seu perfil. Tente novamente.');
		}
	};

	const getProfile = async (userProfile: UserProfileInterface) => {
		if (!userProfile) {
			return;
		}

		const userDocRef = doc(dbFirebase, 'users', userProfile.uid);
		const userDoc = await getDoc(userDocRef);

		if (userDoc.exists()) {
			setUser({ ...userProfile, ...userDoc.data() });
		} else {
			setUser(userProfile);
		}

		setIsLoading(false);
	};

	// TODO: Adicionar uma interface para os valores
	const onRegister = async (values: any) => {
		setIsLoading(true);
		try {
			if (!values?.parentEmail || !values?.password) {
				setIsLoading(false);
				return null;
			}

			const isExistUser = await getDoc(
				doc(dbFirebase, 'users', values.parentEmail)
			);

			if (isExistUser.exists()) {
				setIsLoading(false);
				return null;
			}

			const userCredential = await createUserWithEmailAndPassword(
				authFirebase,
				values.parentEmail,
				values.password
			);
			const user = userCredential.user as UserProfileInterface;

			await setDoc(doc(dbFirebase, 'users', user.uid), {
				school: values?.school,
				parentName: values?.parentName,
				email: values?.parentEmail,
				phone: values?.parentPhone,
				childName: values?.childName,
				childBirthDate: values?.childBirthDate,
				createdAt: new Date(),
			});

			setUser(user);
			setIsLoading(false);
			return user;
		} catch (error) {
			console.error(error);
			setIsLoading(false);
			return null;
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(authFirebase, (user) => {
			if (user) {
				getProfile(user);
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
	};
};
