import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Text } from 'react-native';
import { LoadingState, MemoryGameBoard, Screen, SectionCard } from '@/components';
import { useAuth, useCharacterSelection } from '@/contexts';
import {
	charactersService,
	memoryGameService,
	scoreGamesService,
	tw,
} from '@/utils';
import { GamesEnum, type ScoreInterface } from '@etnos/types';

export default function MemoryGamePage() {
	const { user } = useAuth();
	const { selectedCharacterSlug } = useCharacterSelection();

	const charactersQuery = useQuery({
		queryKey: ['characters'],
		queryFn: () => charactersService.getCharacters(),
	});

	const memoryContentQuery = useQuery({
		queryKey: ['memory-game', selectedCharacterSlug],
		enabled: Boolean(selectedCharacterSlug),
		queryFn: () => memoryGameService.getMemoryGameImages(selectedCharacterSlug ?? ''),
	});

	const scoreQuery = useQuery({
		queryKey: ['memory-game-score', user?.uid],
		enabled: Boolean(user?.uid),
		queryFn: () => scoreGamesService.getScore(user?.uid ?? ''),
	});

	const selectedCharacter = useMemo(
		() =>
			charactersQuery.data?.find(
				(character) => character.slug === selectedCharacterSlug,
			) ?? null,
		[charactersQuery.data, selectedCharacterSlug],
	);

	const bestScore = useMemo<ScoreInterface | null>(
		() =>
			scoreQuery.data?.find(
				(score) =>
					score.slug === GamesEnum.MEMORY_GAME &&
					score.characterSlug === selectedCharacterSlug,
			) ?? null,
		[scoreQuery.data, selectedCharacterSlug],
	);

	if (!selectedCharacterSlug) {
		return (
			<Screen>
				<SectionCard>
					<Text style={tw`text-2xl font-black text-primary`}>
						Escolha um personagem antes de jogar
					</Text>
					<Text style={tw`mt-3 text-base leading-7 text-stone-700`}>
						A seleção do personagem define o conteúdo cultural que vai aparecer no desafio.
					</Text>
				</SectionCard>
			</Screen>
		);
	}

	if (charactersQuery.isLoading || memoryContentQuery.isLoading || scoreQuery.isLoading) {
		return <LoadingState label="Montando o jogo da memória..." />;
	}

	return (
		<Screen>
			<SectionCard style={tw`mb-4`}>
				<Text style={tw`text-3xl font-black text-primary`}>
					Jogo da Memória
				</Text>
				<Text style={tw`mt-3 text-base leading-7 text-stone-700`}>
					Encontre os pares e descubra símbolos culturais do Brasil com o personagem escolhido.
				</Text>
			</SectionCard>

			<MemoryGameBoard
				bestScore={bestScore}
				character={selectedCharacter}
				content={memoryContentQuery.data ?? []}
				onSaveBestScore={async (score) => {
					if (!user?.uid || !selectedCharacterSlug) {
						return;
					}

					if (score <= (bestScore?.score ?? 0)) {
						Alert.alert(
							'Pontuação registrada',
							'Seu recorde atual continua valendo porque é maior ou igual a este resultado.',
						);
						return;
					}

					await scoreGamesService.saveScore(
						GamesEnum.MEMORY_GAME,
						selectedCharacterSlug,
						score,
						user.uid,
					);

					await scoreQuery.refetch();
					Alert.alert('Recorde salvo', 'Sua nova melhor pontuação foi registrada.');
				}}
				onSaveScoreHistory={async (score) => {
					if (!user?.uid || !selectedCharacterSlug) {
						return;
					}

					await scoreGamesService.saveScoreHistory(
						GamesEnum.MEMORY_GAME,
						selectedCharacterSlug,
						score,
						user.uid,
					);
				}}
			/>
		</Screen>
	);
}
