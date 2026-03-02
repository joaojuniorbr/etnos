import { api } from '../../helpers';

export interface SchoolInterface {
	id: string;
	name: string;
	city?: string;
	state?: string;
}

export const schoolService = {
	getAll(): Promise<SchoolInterface[]> {
		return api.get('/schools').then((res) => res.data);
	},

	create(school: SchoolInterface) {
		return api.post('/schools', school).then((res) => res.data);
	},

	update(id: string, school: Partial<SchoolInterface>) {
		return api.patch(`/schools/${id}`, school).then((res) => res.data);
	},

	delete(id: string) {
		return api.delete(`/schools/${id}`).then((res) => res.data);
	},

	getOne(id: string): Promise<SchoolInterface | null> {
		return api.get(`/schools/${id}`).then((res) => res.data);
	},
};
