import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Alert, Text, View } from 'react-native';
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

export default function ProfilePage() {
	const { isLoading, signOut, updateProfile, user } = useAuth();
	const [childName, setChildName] = useState(user?.childName ?? '');
	const [parentName, setParentName] = useState(user?.parentName ?? '');

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

	const totalScore = scoresQuery.data?.reduce(
		(sum, item) => sum + item.score,
		0,
	) ?? 0;

	const handleSaveProfile = async () => {
		try {
			await updateProfile({
				childName,
				parentName,
			});
			Alert.alert('Perfil atualizado', 'Seus dados foram salvos com sucesso.');
		} catch {
			Alert.alert('Erro', 'Não foi possível atualizar o perfil agora.');
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
			<SectionCard style={tw`mb-4 items-center`}>
				<Image
					source={{
						uri:
							user.photoURL ||
							`https://robohash.org/${encodeURIComponent(user.email ?? user.uid)}`,
					}}
					contentFit="cover"
					style={tw`h-28 w-28 rounded-full bg-stone-200`}
				/>
				<Text style={tw`mt-4 text-2xl font-black text-primary`}>
					{user.childName || user.email}
				</Text>
				<Text style={tw`mt-1 text-sm uppercase text-stone-500`}>
					{user.email}
				</Text>

				<View style={tw`mt-5 w-full flex-row`}>
					<View style={tw`mr-2 flex-1 rounded-2xl bg-secondary px-4 py-4`}>
						<Text style={tw`text-xs font-black uppercase text-primary`}>
							Pontuação total
						</Text>
						<Text style={tw`mt-2 text-3xl font-black text-primary`}>
							{totalScore}
						</Text>
					</View>
					<View style={tw`ml-2 flex-1 rounded-2xl bg-primary px-4 py-4`}>
						<Text style={tw`text-xs font-black uppercase text-white`}>
							Jogos registrados
						</Text>
						<Text style={tw`mt-2 text-3xl font-black text-white`}>
							{scoresQuery.data?.length ?? 0}
						</Text>
					</View>
				</View>
			</SectionCard>

			<SectionCard style={tw`mb-4`}>
				<Text style={tw`mb-4 text-2xl font-black text-primary`}>
					Editar perfil
				</Text>
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
				<InputField editable={false} label="E-mail" value={user.email ?? ''} />
				<PrimaryButton
					label="Salvar alterações"
					loading={isLoading}
					onPress={() => void handleSaveProfile()}
				/>
			</SectionCard>

			<SectionCard style={tw`mb-4`}>
				<AvatarSelector
					currentAvatarUrl={user.photoURL}
					currentCharacterSlug={user.avatarCharacterSlug}
				onPick={handlePickAvatar}
			/>
			</SectionCard>

			<SectionCard style={tw`mb-4`}>
				<Text style={tw`text-2xl font-black text-primary`}>Jogos e pontuação</Text>
				<View style={tw`mt-4`}>
					{scoresQuery.data?.length ? (
						scoresQuery.data.map((game) => (
							<View
								key={`${game.slug}-${game.characterSlug}`}
								style={tw`mb-3 rounded-2xl border border-stone-200 bg-white px-4 py-4`}
							>
								<Text style={tw`text-xs font-bold uppercase text-stone-500`}>
									{GameNameEnum[game.slug as keyof typeof GameNameEnum]}
								</Text>
								<Text style={tw`mt-2 text-2xl font-black text-primary`}>
									{game.score}
								</Text>
								<Text style={tw`mt-1 text-sm text-stone-600`}>
									Personagem: {game.characterSlug}
								</Text>
							</View>
						))
					) : (
						<Text style={tw`text-base leading-7 text-stone-600`}>
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
		</Screen>
	);
}
