import type { AxiosInstance } from 'axios';
import type { SchoolGameAccessInterface, SchoolInterface } from '@etnos/types';

export const createSchoolService = (api: AxiosInstance) => ({
	getAll(): Promise<SchoolInterface[]> {
		return api.get('/schools').then((response) => response.data);
	},

	getMyGameAccess(): Promise<SchoolGameAccessInterface> {
		return api.get('/schools/me/game-access').then((response) => response.data);
	},
});
