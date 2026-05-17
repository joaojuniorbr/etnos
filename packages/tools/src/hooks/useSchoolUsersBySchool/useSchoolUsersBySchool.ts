'use client';

import { useQuery } from '@tanstack/react-query';
import type { SchoolUserInterface } from '@etnos/types';
import { schoolKeys } from '../../query-keys';
import { schoolService } from '@etnos/services';

export const useSchoolUsersBySchool = (
	schoolId: string,
	search?: string,
	options?: { enabled?: boolean },
) =>
	useQuery<SchoolUserInterface[]>({
		queryKey: schoolKeys.viewerUsers(schoolId, search ?? ''),
		queryFn: () =>
			schoolService.getUsersBySchool(schoolId, search || undefined),
		enabled: options?.enabled !== false && Boolean(schoolId),
	});
