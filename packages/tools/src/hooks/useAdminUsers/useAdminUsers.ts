'use client';

import { useQuery } from '@tanstack/react-query';
import type { AdminUserInterface } from '@etnos/types';
import { userKeys } from '../../query-keys';
import { usersService } from '@etnos/services';

export const useAdminUsers = (
	filters: {
		schoolId?: string;
		search?: string;
		hasPushToken?: boolean;
	},
	options?: { enabled?: boolean },
) =>
	useQuery<AdminUserInterface[]>({
		queryKey: userKeys.admin(
			filters.schoolId ?? 'all',
			Boolean(filters.hasPushToken),
			filters.search || 'all',
		),
		queryFn: () => usersService.getAll(filters),
		enabled: options?.enabled !== false,
	});
