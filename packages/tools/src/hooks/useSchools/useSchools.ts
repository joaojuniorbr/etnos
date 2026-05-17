'use client';

import { useQuery } from '@tanstack/react-query';
import type { SchoolInterface } from '@etnos/types';
import { QUERY_STALE_TIME } from '../../constants/query-cache';
import { schoolKeys } from '../../query-keys';
import { schoolService } from '@etnos/services';

export const useSchools = (options?: { enabled?: boolean }) =>
	useQuery<SchoolInterface[]>({
		queryKey: schoolKeys.all(),
		queryFn: () => schoolService.getAll(),
		staleTime: QUERY_STALE_TIME.catalog,
		enabled: options?.enabled !== false,
	});
