'use client';

import { useQuery } from '@tanstack/react-query';
import type { AdminUserInterface } from '@etnos/types';
import { userKeys } from '../../query-keys';
import { usersService } from '@etnos/services';

export const useNotificationUserSearch = (
	search: string,
	options?: { enabled?: boolean },
) =>
	useQuery<AdminUserInterface[]>({
		queryKey: userKeys.searchWithPush(search),
		queryFn: () => usersService.getAll({ search, hasPushToken: true }),
		enabled: options?.enabled !== false && search.length >= 2,
	});
