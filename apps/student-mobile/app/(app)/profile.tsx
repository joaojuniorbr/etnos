import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import {
	AvatarSelector,
	InputField,
	LoadingState,
	PrimaryButton,
	Screen,
	SectionCard,
} from '@/components';
import { useAuth } from '@/contexts';
import { scoreGamesService, tw } from '@/utils';
import { GameNameEnum } from '@etnos/types';

import { charactersService } from '@etnos/tools';

export default function ProfilePage() {
	const { isLoading, signOut, updateProfile, user } = useAuth();
	const [childName, setChildName] = useState(user?.childName ?? '');
	const [parentName, setParentName] = useState(user?.parentName ?? '');

	const { data: characters } = useQuery({
		queryKey: ['character', 'all'],
		queryFn: () => charactersService.getCharacters(),
	});

	useEffect(() => {
		setChildName(user?.childName ?? '');
		setParentName(user?.parentName ?? '');
	}, [user?.childName, user?.parentName]);

	const scoresQuery = useQuery({
		queryKey: ['profile-scores', user?.uid],
		enabled: Boolean(user?.uid),
		queryFn: () => scoreGamesService.getScore(user?.uid ?? ''),
	});

	if (!user) {
		return <LoadingState label="Carregando perfil..." />;
	}

	const totalScore =
		scoresQuery.data?.reduce((sum, item) => sum + item.score, 0) ?? 0;

	const getCharacterBySlug = (slug: string) => {
		return characters?.find((item) => item.slug === slug);
	};

	const handleSaveProfile = async () => {
		try {
			await updateProfile({
				childName,
				parentName,
			});
			Toast.show({
				type: 'success',
				text1: 'Perfil atualizado',
				text2: 'Seus dados foram salvos com sucesso.',
			});
		} catch {
			Toast.show({
				type: 'error',
				text1: 'Erro',
				text2: 'Não foi possível atualizar o perfil agora.',
			});
		}
	};

	const handlePickAvatar = async (avatarUrl: string, characterSlug: string) => {
		if (!avatarUrl) {
			return;
		}

		await updateProfile({
			photoURL: avatarUrl,
			avatarCharacterSlug: characterSlug,
		});
	};

	return (
		<Screen>
			<View style={tw`gap-4`}>
				<SectionCard style={tw`items-center`}>
					<Image
						source={{
							uri:
								user.photoURL ||
								`https://robohash.org/${encodeURIComponent(user.email ?? user.uid)}`,
						}}
						contentFit="cover"
						style={tw`h-40 w-40 rounded-full border border-slate-200`}
					/>
					<Text style={tw`mt-4 text-lg font-black text-primary`}>
						{user.childName || user.email}
					</Text>
					<Text style={tw`text-xs text-stone-500`} numberOfLines={1}>
						{user.email}
					</Text>

					<View style={tw`w-full flex-row gap-4 mt-4`}>
						<View style={tw`flex-1 rounded p-3 bg-secondary`}>
							<Text style={tw`text-xs uppercase text-primary`}>Pontuação</Text>
							<Text style={tw`text-lg font-black text-primary`}>
								{totalScore}
							</Text>
						</View>
						<View style={tw`flex-1 rounded p-3 bg-primary`}>
							<Text style={tw`text-xs uppercase text-white`}>Jogos</Text>
							<Text style={tw`text-xl font-black text-white`}>
								{scoresQuery.data?.length ?? 0}
							</Text>
						</View>
					</View>
				</SectionCard>

				<SectionCard style={tw`gap-6`}>
					<InputField
						label="Nome do estudante"
						onChangeText={setChildName}
						value={childName}
					/>
					<InputField
						label="Nome do responsável"
						onChangeText={setParentName}
						value={parentName}
					/>
					<InputField disabled label="E-mail" value={user.email ?? ''} />
					<PrimaryButton
						label="Salvar alterações"
						loading={isLoading}
						onPress={() => void handleSaveProfile()}
					/>
				</SectionCard>

				<SectionCard>
					<AvatarSelector
						currentAvatarUrl={user.photoURL}
						currentCharacterSlug={user.avatarCharacterSlug}
						onPick={handlePickAvatar}
					/>
				</SectionCard>

				<SectionCard>
					<Text style={tw`text-lg font-black text-primary`}>Pontuação</Text>
					<View style={tw`mt-4 gap-2`}>
						{scoresQuery.data?.length ? (
							scoresQuery.data.map((game) => (
								<View
									key={`${game.slug}-${game.characterSlug}`}
									style={tw`rounded border border-slate-200 bg-white flex-row items-center`}
								>
									<View>
										<Image
											source={{
												uri: getCharacterBySlug(game.characterSlug)?.imageUrl,
											}}
											style={tw`aspect-square w-16`}
											contentFit="contain"
										/>
									</View>
									<View style={tw`flex-1 p-2`}>
										<Text
											style={tw`text-xs font-bold uppercase text-stone-500`}
										>
											{GameNameEnum[game.slug as keyof typeof GameNameEnum]}
										</Text>
										<Text style={tw`text-xl font-black text-primary`}>
											{game.score}
										</Text>
									</View>
								</View>
							))
						) : (
							<Text style={tw`text-base text-stone-600`}>
								Você ainda não possui pontuações salvas.
							</Text>
						)}
					</View>
				</SectionCard>

				<PrimaryButton
					label="Sair"
					variant="ghost"
					onPress={() => void signOut()}
				/>
			</View>
		</Screen>
	);
}
