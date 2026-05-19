export {
	errorMessage,
	formatPhoneBR,
	getRandomIndex,
	normalizePhone,
	slugfy,
} from '../../../../packages/tools/src/helpers';

const noop = () => undefined;
const noopAsync = async () => undefined;
const noopUser = async () => null;

export const useAuth = () => ({
	user: null,
	isLoading: false,
	onRegister: noopAsync,
	onSignInWithEmailAndPassword: noopUser,
	loginWithGoogle: noopUser,
	onSignOut: noopAsync,
	onRecoveryPass: noopAsync,
});

export const useCharacter = (options?: { fetchList?: boolean }) => ({
	selectCharacter: noop,
	selectedCharacter: undefined,
	data: options?.fetchList
		? [
				{
					id: 'iara',
					slug: 'iara',
					name: 'Iara',
					region: 'Norte',
					description: 'Guardiã das águas',
				},
			]
		: undefined,
	isLoading: false,
});

export const useMyGameAccess = () => ({
	data: {
		enabledGameSlugs: ['memory-game', 'guess-game'],
		enabledCharacterSlugs: ['iara', 'saci'],
	},
	isLoading: false,
});

export const useMidia = () => ({
	data: {
		pages: [
			{
				data: [
					{
						id: 'midia-1',
						url: 'https://picsum.photos/seed/etnos-storybook/400',
					},
					{
						id: 'midia-2',
						url: 'https://picsum.photos/seed/etnos-storybook-2/400',
					},
				],
				nextCursor: undefined,
			},
		],
	},
	hasNextPage: false,
	isFetchingNextPage: false,
	isLoading: false,
	isRefetching: false,
	folders: [
		{ folder: 'storybook', count: 2 },
		{ folder: 'avatars', count: 5 },
	],
	uncategorizedCount: 1,
	isLoadingFolders: false,
	refetchFolders: noopAsync,
	refetch: noopAsync,
	fetchNextPage: noopAsync,
	deleteMidia: noopAsync,
	deleteMidiaFromUrl: noopAsync,
	updateMidiaFolder: noopAsync,
	isUpdatingFolder: false,
});

export const useGames = () => ({
	saveGameScoreHistory: noopAsync,
});
