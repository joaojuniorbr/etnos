'use client';

import { useQuery } from '@tanstack/react-query';
import type { SchoolGameAccessInterface } from '@etnos/types';
import { QUERY_STALE_TIME } from '../../constants/query-cache';
import { schoolKeys } from '../../query-keys';
import { schoolService } from '@etnos/services';

export const useMyGameAccess = (options?: { enabled?: boolean }) =>
	useQuery<SchoolGameAccessInterface>({
		queryKey: schoolKeys.myGameAccess(),
		queryFn: () => schoolService.getMyGameAccess(),
		staleTime: QUERY_STALE_TIME.gameAccess,
		enabled: options?.enabled !== false,
	});
