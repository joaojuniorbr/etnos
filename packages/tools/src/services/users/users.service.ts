import type { AdminUserInterface, UpdateAdminUserPayload } from '@etnos/types';
import { api } from '../../helpers';

export const usersService = {
	getAll(filters?: {
		schoolId?: string;
		search?: string;
	}): Promise<AdminUserInterface[]> {
		return api
			.get('/users', {
				params: {
					...(filters?.schoolId ? { schoolId: filters.schoolId } : {}),
					...(filters?.search ? { search: filters.search } : {}),
				},
			})
			.then((res) => res.data);
	},

	update(id: string, payload: UpdateAdminUserPayload) {
		return api.patch(`/users/${id}`, payload).then((res) => res.data);
	},
};
