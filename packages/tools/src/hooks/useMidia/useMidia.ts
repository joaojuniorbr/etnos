import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { MidiaInterface, midiaService } from '../../services';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export const useMidia = (userId?: string, limit = 10, folder?: string) => {
	const infiniteQuery = useInfiniteQuery({
		queryKey: ['midia', userId, limit, folder],
		enabled: !!userId,

		initialPageParam: null as QueryDocumentSnapshot | null,

		queryFn: ({ pageParam }) =>
			midiaService.getMidia(userId!, limit, pageParam ?? undefined, folder),

		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	const foldersQuery = useQuery({
		queryKey: ['midia-folders', userId],
		enabled: !!userId,
		queryFn: () => midiaService.getFolders(userId!),
	});

	return {
		...infiniteQuery,

		folders: foldersQuery.data,
		isLoadingFolders: foldersQuery.isLoading,
		refetchFolders: foldersQuery.refetch,

		deleteMidia: (item: MidiaInterface) => midiaService.deleteMidia(item),
		deleteMidiaFromUrl: (url: string) => midiaService.deleteMidiaFromUrl(url),
	};
};
