'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { GuessGameContentInterface } from '@etnos/types';
import { GamesEnum } from '@etnos/types';
import { guessGameContentService } from '@etnos/services';

export const useGuessGameContentMutations = (characterSlug: string) => {
	const queryClient = useQueryClient();

	const invalidate = () => {
		void queryClient.invalidateQueries({
			queryKey: ['game', GamesEnum.GUESS_GAME, characterSlug],
		});
	};

	const saveContent = useMutation({
		mutationFn: (payload: GuessGameContentInterface) =>
			guessGameContentService.saveContent(payload),
		onSuccess: invalidate,
	});

	const deleteContent = useMutation({
		mutationFn: (id: string) => guessGameContentService.deleteContent(id),
		onSuccess: invalidate,
	});

	return { saveContent, deleteContent };
};
