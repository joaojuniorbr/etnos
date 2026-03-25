'use client';

import { useQuery } from '@tanstack/react-query';
import type { SchoolInterface } from '@etnos/types';
import { schoolService } from '../../services';

export const useSchools = () =>
	useQuery<SchoolInterface[]>({
		queryKey: ['schools', 'all'],
		queryFn: () => schoolService.getAll(),
	});
