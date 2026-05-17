'use client';

import { useQuery } from '@tanstack/react-query';
import type { SchoolInterface } from '@etnos/types';
import { schoolKeys } from '../../query-keys';
import { schoolService } from '@etnos/services';

export const useManagedSchools = (options?: { enabled?: boolean }) =>
	useQuery<SchoolInterface[]>({
		queryKey: schoolKeys.managed(),
		queryFn: () => schoolService.getManagedSchools(),
		enabled: options?.enabled !== false,
	});
