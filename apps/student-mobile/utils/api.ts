import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	createApiClient,
	createAuthService,
	createCharactersService,
	createMemoryGameService,
	createSchoolService,
	createScoreGamesService,
	createSessionStorage,
	type StorageAdapter,
} from '@etnos/core';

const storageAdapter: StorageAdapter = {
	getItem: (key) => AsyncStorage.getItem(key),
	setItem: (key, value) => AsyncStorage.setItem(key, value),
	removeItem: (key) => AsyncStorage.removeItem(key),
};

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
