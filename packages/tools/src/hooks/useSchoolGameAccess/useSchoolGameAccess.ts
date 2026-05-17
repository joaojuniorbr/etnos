'use client';

import { useQuery } from '@tanstack/react-query';
import type { SchoolGameAccessInterface } from '@etnos/types';
import { schoolKeys } from '../../query-keys';
import { schoolService } from '@etnos/services';

export const useSchoolGameAccess = (
	schoolId: string,
	options?: { enabled?: boolean },
) =>
	useQuery<SchoolGameAccessInterface>({
		queryKey: schoolKeys.gameAccess(schoolId),
		queryFn: () => schoolService.getGameAccessBySchool(schoolId),
		enabled: options?.enabled !== false && Boolean(schoolId),
	});
