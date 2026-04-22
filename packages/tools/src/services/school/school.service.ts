import { api } from '../../helpers';
import type {
	SchoolInterface,
	SchoolRankingInterface,
	SchoolUserInterface,
	UserRankingInterface,
} from '@etnos/types';

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

	getMySchool(): Promise<SchoolInterface> {
		return api.get('/schools/me').then((res) => res.data);
	},

	getManagedSchools(): Promise<SchoolInterface[]> {
		return api.get('/schools/me/managed').then((res) => res.data);
	},

	getMyUsers(search?: string): Promise<SchoolUserInterface[]> {
		return api
			.get('/schools/me/users', {
				params: search ? { search } : undefined,
			})
			.then((res) => res.data);
	},

	getUsersBySchool(
		schoolId: string,
		search?: string,
	): Promise<SchoolUserInterface[]> {
		return api
			.get(`/schools/${schoolId}/users`, {
				params: search ? { search } : undefined,
			})
			.then((res) => res.data);
	},

	getRanking(gameSlug?: string): Promise<SchoolRankingInterface[]> {
		return api
			.get('/schools/me/ranking', {
				params: gameSlug ? { gameSlug } : undefined,
			})
			.then((res) => res.data);
	},

	getMyUsersRanking(gameSlug?: string): Promise<UserRankingInterface[]> {
		return api
			.get('/schools/me/users/ranking', {
				params: gameSlug ? { gameSlug } : undefined,
			})
			.then((res) => res.data);
	},

	getUsersRankingBySchool(
		schoolId: string,
		gameSlug?: string,
	): Promise<UserRankingInterface[]> {
		return api
			.get(`/schools/${schoolId}/users/ranking`, {
				params: gameSlug ? { gameSlug } : undefined,
			})
			.then((res) => res.data);
	},

	getAccessUsersBySchool(schoolId: string): Promise<SchoolUserInterface[]> {
		return api.get(`/schools/${schoolId}/access-users`).then((res) => res.data);
	},

	addAccessUserToSchool(schoolId: string, email: string) {
		return api
			.post(`/schools/${schoolId}/access-users`, { email })
			.then((res) => res.data);
	},

	removeAccessUserFromSchool(schoolId: string, userId: string) {
		return api
			.delete(`/schools/${schoolId}/access-users/${userId}`)
			.then((res) => res.data);
	},
};
