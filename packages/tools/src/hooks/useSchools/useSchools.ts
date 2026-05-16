'use client';

import { useQuery } from '@tanstack/react-query';
import type { SchoolInterface } from '@etnos/types';
import { schoolService } from '../../services';

export const useSchools = (options?: { enabled?: boolean }) =>
	useQuery<SchoolInterface[]>({
		queryKey: ['schools', 'all'],
		queryFn: () => schoolService.getAll(),
		enabled: options?.enabled !== false,
	});
