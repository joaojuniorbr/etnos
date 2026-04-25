import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Text } from 'react-native';
import {
	GameCard,
	LoadingState,
	PrimaryButton,
	Screen,
	SectionCard,
} from '@/components';
import { studentGames } from '@/constants';
import { useCharacterSelection } from '@/contexts';
import { schoolService, tw } from '@/utils';
import { Image } from 'expo-image';

export default function GamesPage() {
	const { selectedCharacterSlug } = useCharacterSelection();
	const gameAccessQuery = useQuery({
		queryKey: ['school-game-access'],
		queryFn: () => schoolService.getMyGameAccess(),
	});

	if (gameAccessQuery.isLoading) {
		return <LoadingState label="Buscando jogos liberados..." />;
	}

	const enabledGames = studentGames.filter((game) =>
		gameAccessQuery.data?.enabledGameSlugs?.includes(game.slug),
	);

	return (
		<Screen>
			{!selectedCharacterSlug ? (
				<SectionCard style={tw`gap-2`}>
					<Image
						source={require('@/assets/images/persona-group.jpg')}
						contentFit="contain"
						style={tw`w-full h-30`}
					/>
					<Text style={tw`text-lg font-black text-primary text-center`}>
						Falta escolher um personagem
					</Text>
					<Text style={tw`text-sm text-center mb-4`}>
						Volte para a aba Personagem e selecione seu guia cultural antes de
						entrar em um jogo.
					</Text>
					<PrimaryButton
						label="Escolher personagem"
						onPress={() => router.push('/characters')}
						variant="secondary"
					/>
				</SectionCard>
			) : enabledGames.length ? (
				enabledGames.map((game) => (
					<GameCard
						key={game.slug}
						game={game}
						character={selectedCharacterSlug}
						onPress={() => router.push(game.url as '/games/memory')}
					/>
				))
			) : (
				<SectionCard>
					<Text style={tw`text-xl font-black text-primary`}>
						Nenhum jogo habilitado
					</Text>
					<Text style={tw`mt-3 text-base leading-7 text-stone-700`}>
						Sua escola ainda não possui jogos liberados para este perfil.
					</Text>
				</SectionCard>
			)}
		</Screen>
	);
}
