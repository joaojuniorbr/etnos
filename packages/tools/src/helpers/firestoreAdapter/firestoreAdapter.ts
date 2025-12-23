import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
	collection,
	doc,
	getDocs,
	query,
	where,
	orderBy,
	setDoc,
	deleteDoc,
	updateDoc,
	serverTimestamp,
	startAfter,
	limit,
	getFirestore,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

export const googleProvider = new GoogleAuthProvider();

export const storageFirebase = getStorage(app);

export const firestoreAdapter = {
	collection: (name: string) => collection(dbFirebase, name),

	doc: (collectionRef: any, id?: string) =>
		id ? doc(collectionRef, id) : doc(collectionRef),

	query,
	where,
	orderBy,
	deleteDoc,
	getDocs,
	setDoc,
	updateDoc,
	serverTimestamp,
	startAfter,
	limit,
	getFirestore,
};
