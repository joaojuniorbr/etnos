import { api } from '../../api';
import type {
	GuessGameContentInterface,
	GuessGamePlayItemInterface,
	GuessGameValidationPayloadInterface,
	GuessGameValidationResultInterface,
} from '@etnos/types';

export const guessGameContentService = {
	saveContent(payload: GuessGameContentInterface) {
		return api.post('/games/guess', payload).then((res) => res.data);
	},

	getContent(characterSlug: string): Promise<GuessGameContentInterface[]> {
		return api.get(`/games/guess/${characterSlug}`).then((res) => res.data);
	},

	getPlayableContent(
		characterSlug: string,
	): Promise<GuessGamePlayItemInterface | null> {
		return api
			.get(`/games/guess/play/${characterSlug}`)
			.then((res) => res.data);
	},

	validateAttempt(
		payload: GuessGameValidationPayloadInterface,
	): Promise<GuessGameValidationResultInterface> {
		return api.post('/games/guess/validate', payload).then((res) => res.data);
	},

	deleteContent(id: string) {
		return api.delete(`/games/guess/${id}`).then((res) => res.data);
	},
};
