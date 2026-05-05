import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Text, View } from 'react-native';
import { CharacterCard, LoadingState, Screen, SectionCard } from '@/components';
import { useCharacterSelection } from '@/contexts';
import { charactersService, schoolService, tw } from '@/utils';

export default function CharactersPage() {
	const { selectedCharacterSlug, selectCharacter } = useCharacterSelection();
	const charactersQuery = useQuery({
		queryKey: ['characters'],
		queryFn: () => charactersService.getCharacters(),
	});
	const gameAccessQuery = useQuery({
		queryKey: ['school-game-access'],
		queryFn: () => schoolService.getMyGameAccess(),
	});

	const enabledCharacters = useMemo(() => {
		if (!charactersQuery.data) {
			return [];
		}

		const enabledSlugs = gameAccessQuery.data?.enabledCharacterSlugs;

		if (!enabledSlugs?.length) {
			return charactersQuery.data;
		}

		return charactersQuery.data.filter((character) =>
			enabledSlugs.includes(character.slug),
		);
	}, [charactersQuery.data, gameAccessQuery.data?.enabledCharacterSlugs]);

	useEffect(() => {
		if (!selectedCharacterSlug || !gameAccessQuery.data) {
			return;
		}

		if (
			!gameAccessQuery.data.enabledCharacterSlugs.includes(
				selectedCharacterSlug,
			)
		) {
			selectCharacter(null);
		}
	}, [gameAccessQuery.data, selectCharacter, selectedCharacterSlug]);

	if (charactersQuery.isLoading || gameAccessQuery.isLoading) {
		return <LoadingState label="Buscando personagens..." />;
	}

	return (
		<Screen>
			<View style={tw`gap-4`}>
				<SectionCard style={tw`gap-1`}>
					<Text style={tw`text-lg font-black text-primary uppercase`}>
						Escolha seu guia cultural
					</Text>
					<Text style={tw`text-xs`}>
						Cada personagem representa uma região do Brasil e acompanha você nos
						jogos.
					</Text>
				</SectionCard>

				<View style={tw`flex flex-row flex-wrap -mx-1`}>
					{enabledCharacters.map((character) => (
						<View key={character.slug} style={tw`w-1/2 p-1`}>
							<CharacterCard
								character={character}
								selected={selectedCharacterSlug === character.slug}
								onPress={() => selectCharacter(character.slug)}
							/>
						</View>
					))}
				</View>
			</View>
		</Screen>
	);
}
