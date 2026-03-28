'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { MidiaInterface } from '@etnos/types';
import { midiaService } from '../../services';

export const useMidia = (
	userId?: string,
	limit = 10,
	folder?: string,
	showAll = false
) => {
	const infiniteQuery = useInfiniteQuery({
		queryKey: ['midia', userId, limit, folder, showAll],
		enabled: !!userId,

		initialPageParam: 1,

		queryFn: ({ pageParam }) =>
			midiaService.getMidia(userId!, limit, pageParam, folder, showAll),

		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	const foldersQuery = useQuery({
		queryKey: ['midia-folders', userId, showAll],
		enabled: !!userId,
		queryFn: () => midiaService.getFolders(userId!, showAll),
	});

	return {
		...infiniteQuery,

		folders: foldersQuery.data,
		isLoadingFolders: foldersQuery.isLoading,
		refetchFolders: foldersQuery.refetch,

		deleteMidia: (item: MidiaInterface) =>
			midiaService.deleteMidia(item, showAll),
		deleteMidiaFromUrl: (url: string) =>
			midiaService.deleteMidiaFromUrl(url, showAll),
	};
};
