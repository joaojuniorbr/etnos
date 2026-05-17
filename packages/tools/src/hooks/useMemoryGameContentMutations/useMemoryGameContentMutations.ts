'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MemoryGameContentInterface } from '@etnos/types';
import { GamesEnum } from '@etnos/types';
import { memoryGameContentService } from '@etnos/services';

export const useMemoryGameContentMutations = (characterSlug: string) => {
	const queryClient = useQueryClient();

	const invalidate = () => {
		void queryClient.invalidateQueries({
			queryKey: ['game', GamesEnum.MEMORY_GAME],
		});
	};

	const saveContent = useMutation({
		mutationFn: (payload: Partial<MemoryGameContentInterface>) =>
			memoryGameContentService.saveContent(payload),
		onSuccess: invalidate,
	});

	const deleteContent = useMutation({
		mutationFn: (id: string) => memoryGameContentService.deleteContent(id),
		onSuccess: invalidate,
	});

	return { saveContent, deleteContent };
};
