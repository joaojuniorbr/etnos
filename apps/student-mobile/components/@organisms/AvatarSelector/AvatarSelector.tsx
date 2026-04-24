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
		selectedCharacterSlug || currentCharacterSlug || charactersQuery.data?.[0]?.slug || '';

	const avatarsQuery = useQuery({
		queryKey: ['profile-avatars', effectiveCharacterSlug],
		enabled: Boolean(effectiveCharacterSlug),
		queryFn: () => charactersService.getCharacterAvatars(effectiveCharacterSlug),
	});

	if (charactersQuery.isLoading) {
		return (
			<View style={tw`items-center justify-center py-8`}>
				<ActivityIndicator color="#371f12" />
			</View>
		);
	}

	return (
		<View>
			<Text style={tw`mb-3 text-base font-black uppercase text-primary`}>
				Trocar avatar
			</Text>
			<Text style={tw`mb-4 text-sm leading-6 text-stone-600`}>
				Escolha um personagem e depois selecione a imagem que vai aparecer no seu perfil.
			</Text>

			<View style={tw`mb-5 flex-row flex-wrap justify-between`}>
				{charactersQuery.data?.map((character: CharacterInterface) => {
					const isSelected = effectiveCharacterSlug === character.slug;

					return (
						<Pressable
							key={character.slug}
							onPress={() => setSelectedCharacterSlug(character.slug)}
							style={[
								tw`mb-3 w-[48%] rounded-2xl border bg-white p-3`,
								isSelected ? tw`border-primary` : tw`border-stone-200`,
							]}
						>
							{character.imageUrl ? (
								<Image
									source={{ uri: character.imageUrl }}
									contentFit="cover"
									style={tw`mb-3 h-24 w-full rounded-xl bg-stone-100`}
								/>
							) : null}
							<Text style={tw`text-sm font-black text-primary`}>
								{character.name}
							</Text>
							<Text style={tw`mt-1 text-xs uppercase text-stone-500`}>
								{character.region}
							</Text>
						</Pressable>
					);
				})}
			</View>

			{avatarsQuery.isLoading ? (
				<View style={tw`items-center justify-center py-8`}>
					<ActivityIndicator color="#371f12" />
				</View>
			) : (
				<View style={tw`flex-row flex-wrap justify-between`}>
					{avatarsQuery.data?.map((avatar: MidiaInterface) => {
						const isSelected = currentAvatarUrl === avatar.url;

						return (
							<Pressable
								key={avatar.id ?? avatar.url}
								onPress={() => void onPick(avatar.url, effectiveCharacterSlug)}
								style={[
									tw`mb-3 w-[31%] overflow-hidden rounded-2xl border bg-white`,
									isSelected ? tw`border-primary` : tw`border-stone-200`,
								]}
							>
								<Image
									source={{ uri: avatar.url }}
									contentFit="cover"
									style={tw`aspect-square w-full bg-stone-100`}
								/>
							</Pressable>
						);
					})}
				</View>
			)}
		</View>
	);
};
