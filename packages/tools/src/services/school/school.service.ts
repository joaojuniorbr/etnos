import { firestoreAdapter as fs } from '../../helpers';
import { FirestoreRepository } from '../../firestore';

export interface SchoolInterface {
	id: string;
	name: string;
	city?: string;
	state?: string;
}

const repo = new FirestoreRepository<SchoolInterface>('schools');

export const schoolService = {
	async getAll(): Promise<SchoolInterface[]> {
		return repo.findMany({
			orderBy: fs.orderBy('name', 'asc'),
		});
	},

	async create(school: SchoolInterface) {
		const exists = await repo.findOne({
			where: [fs.where('name', '==', school.name)],
		});

		if (exists) return null;

		return repo.create(school);
	},

	async update(id: string, school: Partial<SchoolInterface>) {
		const existing = await repo.findOne({
			where: [
				fs.where('name', '==', school.name),
				fs.where('city', '==', school.city ?? null),
			],
		});

		if (existing && existing.id !== id) return null;

		return repo.update(id, school);
	},

	async delete(id: string) {
		return repo.delete(id);
	},

	async getOne(id: string): Promise<SchoolInterface | null> {
		return repo.findOne({
			where: [fs.where('__name__', '==', id)],
		});
	},
};
