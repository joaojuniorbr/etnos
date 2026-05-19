import type { StudentDashboardInterface } from '@etnos/types';
import { api } from '../../api';

export const studentDashboardService = {
	getDashboard(characterSlug?: string) {
		return api
			.get<StudentDashboardInterface>('/dashboard/student', {
				params: characterSlug ? { characterSlug } : undefined,
			})
			.then((response) => response.data);
	},
};
