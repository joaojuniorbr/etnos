import { firestoreAdapter as fs } from '../helpers';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export interface QueryOptions {
	where?: Array<ReturnType<typeof fs.where>>;
	orderBy?: ReturnType<typeof fs.orderBy>;
	limit?: number;
	startAfter?: QueryDocumentSnapshot;
}

export class FirestoreRepository<T extends { id?: string }> {
	constructor(private readonly collectionName: string) {}

	private get collectionRef() {
		return fs.collection(this.collectionName);
	}

	async findMany(options?: QueryOptions): Promise<T[]> {
		const constraints = [];

		if (options?.where) constraints.push(...options.where);
		if (options?.orderBy) constraints.push(options.orderBy);
		if (options?.startAfter)
			constraints.push(fs.startAfter(options.startAfter));
		if (options?.limit) constraints.push(fs.limit(options.limit));

		const q = fs.query(this.collectionRef, ...constraints);
		const snap = await fs.getDocs(q);

		const data = snap.docs.map(
			(doc) =>
				({
					id: doc.id,
					...doc.data(),
				}) as T
		);

		return data;
	}

	async findWithPaginate(options?: QueryOptions) {
		const constraints = [];
		if (options?.where) constraints.push(...options.where);
		if (options?.orderBy) constraints.push(options.orderBy);
		if (options?.startAfter)
			constraints.push(fs.startAfter(options.startAfter));
		if (options?.limit) constraints.push(fs.limit(options.limit));

		const q = fs.query(this.collectionRef, ...constraints);
		const snap = await fs.getDocs(q);

		const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);

		return {
			data,
			lastDoc: snap.docs[snap.docs.length - 1], // Este é o cursor
		};
	}

	async findOne(options: QueryOptions): Promise<T | null> {
		const result = await this.findMany({
			...options,
			limit: 1,
		});

		return result[0] ?? null;
	}

	async create(data: T) {
		const ref = fs.doc(this.collectionRef);
		await fs.setDoc(ref, {
			...data,
			createdAt: fs.serverTimestamp(),
			timestamp: fs.serverTimestamp(),
		});

		return ref;
	}

	async update(id: string, data: Partial<T>) {
		const ref = fs.doc(this.collectionRef, id);
		await fs.updateDoc(ref, {
			...data,
			timestamp: fs.serverTimestamp(),
		});

		return ref;
	}

	async delete(id: string) {
		return fs.deleteDoc(fs.doc(this.collectionRef, id));
	}
}
