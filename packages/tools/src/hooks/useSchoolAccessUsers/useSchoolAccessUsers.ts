'use client';

import { useQuery } from '@tanstack/react-query';
import type { SchoolUserInterface } from '@etnos/types';
import { schoolKeys } from '../../query-keys';
import { schoolService } from '@etnos/services';

export const useSchoolAccessUsers = (
	schoolId: string,
	options?: { enabled?: boolean },
) =>
	useQuery<SchoolUserInterface[]>({
		queryKey: schoolKeys.accessUsers(schoolId),
		queryFn: () => schoolService.getAccessUsersBySchool(schoolId),
		enabled: options?.enabled !== false && Boolean(schoolId),
	});
