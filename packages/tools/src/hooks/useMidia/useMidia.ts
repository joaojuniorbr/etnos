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
			showAll
				? midiaService.getMidia(userId!, limit, pageParam, folder, true)
				: midiaService.getMidia(userId!, limit, pageParam, folder),

		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	const foldersQuery = useQuery({
		queryKey: ['midia-folders', userId, showAll],
		enabled: !!userId,
		queryFn: () =>
			showAll
				? midiaService.getFolders(userId!, true)
				: midiaService.getFolders(userId!),
	});

	return {
		...infiniteQuery,

		folders: foldersQuery.data,
		isLoadingFolders: foldersQuery.isLoading,
		refetchFolders: foldersQuery.refetch,

		deleteMidia: (item: MidiaInterface) =>
			showAll ? midiaService.deleteMidia(item, true) : midiaService.deleteMidia(item),
		deleteMidiaFromUrl: (url: string) =>
			showAll
				? midiaService.deleteMidiaFromUrl(url, true)
				: midiaService.deleteMidiaFromUrl(url),
	};
};
