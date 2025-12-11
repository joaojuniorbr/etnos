import { useInfiniteQuery } from '@tanstack/react-query';
import { MidiaInterface, midiaService } from '../../services';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export const useMidia = (userId?: string, limit = 10) => {
	const infiniteQuery = useInfiniteQuery({
		queryKey: ['midia', userId, limit],
		enabled: !!userId,

		initialPageParam: null as QueryDocumentSnapshot | null,

		queryFn: ({ pageParam }) =>
			midiaService.getMidia(userId!, limit, pageParam ?? undefined),

		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	return {
		...infiniteQuery,
		deleteMidia: (item: MidiaInterface) => midiaService.deleteMidia(item),
		deleteMidiaFromUrl: (url: string) => midiaService.deleteMidiaFromUrl(url),
	};
};
