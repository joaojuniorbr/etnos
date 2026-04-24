import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Text } from 'react-native';
import { GameCard, LoadingState, Screen, SectionCard } from '@/components';
import { studentGames } from '@/constants';
import { useCharacterSelection } from '@/contexts';
import { schoolService, tw } from '@/utils';

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
			<SectionCard style={tw`mb-4`}>
				<Text style={tw`text-3xl font-black text-primary`}>
					Escolha seu jogo
				</Text>
				<Text style={tw`mt-3 text-base leading-7 text-stone-700`}>
					Agora que seu personagem está pronto, escolha o desafio que vai começar sua jornada.
				</Text>
			</SectionCard>

			{!selectedCharacterSlug ? (
				<SectionCard>
					<Text style={tw`text-xl font-black text-primary`}>
						Falta escolher um personagem
					</Text>
					<Text style={tw`mt-3 text-base leading-7 text-stone-700`}>
						Volte para a aba Personagem e selecione seu guia cultural antes de entrar em um jogo.
					</Text>
				</SectionCard>
			) : enabledGames.length ? (
				enabledGames.map((game) => (
					<GameCard
						key={game.slug}
						game={game}
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
