import { Href, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import {
	GameCard,
	LoadingState,
	PrimaryButton,
	Screen,
	SectionCard,
} from '@/components';
import { trackGameSelectedNative } from '@etnos/analytics/native';
import { studentGames } from '@/constants';
import { useCharacterSelection } from '@/contexts';
import { schoolKeys } from '@etnos/tools';
import { schoolService, tw } from '@/utils';
import { Image } from 'expo-image';

export default function GamesPage() {
	const { selectedCharacterSlug } = useCharacterSelection();
	const gameAccessQuery = useQuery({
		queryKey: schoolKeys.myGameAccess(),
		queryFn: () => schoolService.getMyGameAccess(),
		staleTime: 30_000,
	});

	if (gameAccessQuery.isLoading) {
		return <LoadingState label="Buscando jogos liberados..." />;
	}

	const enabledGames = studentGames.filter((game) =>
		gameAccessQuery.data?.enabledGameSlugs?.includes(game.slug),
	);

	let content: ReactNode;

	if (!selectedCharacterSlug) {
		content = (
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
		);
	} else if (enabledGames.length) {
		content = enabledGames.map((game) => (
			<GameCard
				key={game.slug}
				game={game}
				character={selectedCharacterSlug}
				onPress={() => {
					void trackGameSelectedNative({
						game_slug: game.slug,
						character_slug: selectedCharacterSlug,
						game_name: game.name,
					});
					router.push(game.url as Href);
				}}
			/>
		));
	} else {
		content = (
			<SectionCard>
				<Text style={tw`text-xl font-black text-primary`}>
					Nenhum jogo habilitado
				</Text>
				<Text style={tw`mt-3 text-base leading-7 text-stone-700`}>
					Sua escola ainda não possui jogos liberados para este perfil.
				</Text>
			</SectionCard>
		);
	}

	return <Screen>{content}</Screen>;
}
