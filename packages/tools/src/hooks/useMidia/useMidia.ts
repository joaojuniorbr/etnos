'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MidiaInterface } from '@etnos/types';
import { midiaService } from '@etnos/services';

export const useMidia = (
	userId?: string,
	limit = 10,
	folder?: string,
	showAll = false,
) => {
	const queryClient = useQueryClient();

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

	const updateFolderMutation = useMutation({
		mutationFn: ({
			id,
			folder: targetFolder,
		}: {
			id: string;
			folder: string | null;
		}) => midiaService.updateMidiaFolder(id, targetFolder, showAll),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['midia', userId] });
			queryClient.invalidateQueries({ queryKey: ['midia-folders', userId] });
		},
	});

	return {
		...infiniteQuery,

		folders: foldersQuery.data?.folders ?? [],
		uncategorizedCount: foldersQuery.data?.uncategorizedCount ?? 0,
		isLoadingFolders: foldersQuery.isLoading,
		refetchFolders: foldersQuery.refetch,

		deleteMidia: (item: MidiaInterface) =>
			midiaService.deleteMidia(item, showAll),
		deleteMidiaFromUrl: (url: string) =>
			midiaService.deleteMidiaFromUrl(url, showAll),
		updateMidiaFolder: updateFolderMutation.mutateAsync,
		isUpdatingFolder: updateFolderMutation.isPending,
	};
};
