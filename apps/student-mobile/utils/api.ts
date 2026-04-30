import {
	createApiClient,
	createAuthService,
	createCharactersService,
	createMemoryGameService,
	createNotificationsService,
	createSchoolService,
	createScoreGamesService,
	createSessionStorage,
} from '@etnos/core';
import { storageAdapter } from './storageAdapter';

export const sessionStorage = createSessionStorage(storageAdapter);

export const api = createApiClient({
	baseURL: process.env.EXPO_PUBLIC_API_URL,
	resolveToken: () =>
		sessionStorage.resolveValidStoredAuthToken(
			process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
		),
	onRequestAuthenticated: () => sessionStorage.updateAuthActivity(),
});

export const authService = createAuthService(api);
export const charactersService = createCharactersService(api);
export const schoolService = createSchoolService(api);
export const scoreGamesService = createScoreGamesService(api);
export const memoryGameService = createMemoryGameService(api);
export const notificationsService = createNotificationsService(api);
