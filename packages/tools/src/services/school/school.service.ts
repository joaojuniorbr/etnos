import { dbFirebase } from '@etnos/tools';
import {
	getDocs,
	collection,
	doc,
	setDoc,
	deleteDoc,
	getDoc,
} from 'firebase/firestore';

const COLLECTION = 'schools';

export interface SchoolInterface {
	id: string;
	name: string;
	city?: string;
	state?: string;
}

export const schoolService = {
	async getAll(): Promise<SchoolInterface[]> {
		const collectionRef = collection(dbFirebase, COLLECTION);
		const querySnapshot = await getDocs(collectionRef);
		const schools: any[] = querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		return schools;
	},

	async create(school: SchoolInterface) {
		const collectionRef = collection(dbFirebase, COLLECTION);
		const docRef = doc(collectionRef);
		return setDoc(docRef, school);
	},

	async update(id: string, school: Partial<SchoolInterface>) {
		const collectionRef = collection(dbFirebase, COLLECTION);
		const docRef = doc(collectionRef, id);

		const docSnap = await getDoc(docRef);
		const data = docSnap.data();

		return setDoc(docRef, {
			...data,
			...school,
		});
	},

	async delete(id: string) {
		const collectionRef = collection(dbFirebase, COLLECTION);
		const docRef = doc(collectionRef, id);
		return deleteDoc(docRef);
	},

	async getOne(id: string) {
		const collectionRef = collection(dbFirebase, COLLECTION);
		const docRef = doc(collectionRef, id);
		const docSnap = await getDoc(docRef);
		return docSnap.data() as SchoolInterface;
	},
};
