import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { CharacterInterface, MidiaInterface } from '@etnos/types';
import { charactersService, tw } from '@/utils';

type AvatarSelectorProps = {
	currentAvatarUrl?: string | null;
	currentCharacterSlug?: string | null;
	onPick: (avatarUrl: string, characterSlug: string) => Promise<void>;
};

export const AvatarSelector = ({
	currentAvatarUrl,
	currentCharacterSlug,
	onPick,
}: AvatarSelectorProps) => {
	const [selectedCharacterSlug, setSelectedCharacterSlug] = useState(
		currentCharacterSlug ?? '',
	);

	useEffect(() => {
		setSelectedCharacterSlug(currentCharacterSlug ?? '');
	}, [currentCharacterSlug]);

	const charactersQuery = useQuery({
		queryKey: ['profile-avatar-characters'],
		queryFn: () => charactersService.getCharacters(),
	});

	const effectiveCharacterSlug =
		selectedCharacterSlug ||
		currentCharacterSlug ||
		charactersQuery.data?.[0]?.slug ||
		'';

	const avatarsQuery = useQuery({
		queryKey: ['profile-avatars', effectiveCharacterSlug],
		enabled: Boolean(effectiveCharacterSlug),
		queryFn: () =>
			charactersService.getCharacterAvatars(effectiveCharacterSlug),
	});

	if (charactersQuery.isLoading) {
		return (
			<View style={tw`items-center justify-center py-8`}>
				<ActivityIndicator color={tw.color('primary')} />
			</View>
		);
	}

	return (
		<View>
			<Text style={tw`text-lg font-black uppercase text-primary`}>
				Trocar avatar
			</Text>
			<Text style={tw`mb-4 text-xs`}>
				Escolha um personagem e depois selecione a imagem que vai aparecer no
				seu perfil.
			</Text>

			<View style={tw`mb-5 flex-row flex-wrap justify-center -mx-1`}>
				{charactersQuery.data?.map((character: CharacterInterface) => {
					const isSelected = effectiveCharacterSlug === character.slug;

					return (
						<View key={character.slug} style={tw`w-1/3 p-1`}>
							<Pressable
								onPress={() => setSelectedCharacterSlug(character.slug)}
								style={[
									tw`rounded border-2 bg-white`,
									isSelected ? tw`border-primary` : tw`border-stone-200`,
								]}
							>
								{character.imageUrl ? (
									<Image
										source={{ uri: character.imageUrl }}
										contentFit="cover"
										style={tw`aspect-square w-full rounded-xl bg-stone-100`}
									/>
								) : null}
							</Pressable>
						</View>
					);
				})}
			</View>

			{avatarsQuery.isLoading ? (
				<View style={tw`items-center justify-center py-8`}>
					<ActivityIndicator color="#371f12" />
				</View>
			) : (
				<View style={tw`flex-row flex-wrap -ml-1`}>
					{avatarsQuery.data?.map((avatar: MidiaInterface) => {
						const isSelected = currentAvatarUrl === avatar.url;

						return (
							<View key={avatar.id ?? avatar.url} style={tw`w-1/5 pl-1 pb-1`}>
								<Pressable
									onPress={() =>
										void onPick(avatar.url, effectiveCharacterSlug)
									}
									style={[
										tw`overflow-hidden rounded border bg-white`,
										isSelected ? tw`border-primary` : tw`border-slate-200`,
									]}
								>
									<Image
										source={{ uri: avatar.url }}
										contentFit="cover"
										style={tw`aspect-square w-full`}
									/>
								</Pressable>
							</View>
						);
					})}
				</View>
			)}
		</View>
	);
};
