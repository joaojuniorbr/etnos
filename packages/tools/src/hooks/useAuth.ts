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
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

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
const auth = getAuth(app);
const db = getFirestore(app);

export const useAuth = () => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const onSignOut = async () => {
		setIsLoading(true);
		try {
			await signOut(auth);
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
			const result = await signInWithEmailAndPassword(auth, email, password);
			setUser(result.user);
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
			await sendPasswordResetEmail(auth, email);
			setIsLoading(false);
		} catch (error) {
			console.error(error);
			setIsLoading(false);
		}
	};

	// TODO: Adicionar uma interface para os valores
	const onRegister = async (values: any) => {
		setIsLoading(true);
		try {
			if (!values?.parentEmail || !values?.password) {
				setIsLoading(false);
				return null;
			}

			const isExistUser = await getDoc(doc(db, 'users', values.parentEmail));

			if (isExistUser.exists()) {
				setIsLoading(false);
				return null;
			}

			const userCredential = await createUserWithEmailAndPassword(
				auth,
				values.parentEmail,
				values.password
			);
			const user = userCredential.user;

			await setDoc(doc(db, 'users', user.uid), {
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
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUser(user);
			} else {
				setUser(null);
			}
			setIsLoading(false);
		});

		return () => unsubscribe();
	}, []);

	return {
		isLoading,
		user,
		onRegister,
		onSignOut,
		onSignInWithEmailAndPassword,
		onRecoveryPass,
	};
};
