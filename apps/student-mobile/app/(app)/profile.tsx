import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { RefreshControl, Switch, Text, View } from 'react-native';
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
import { charactersService, scoreGamesService, tw } from '@/utils';
import {
	GameNameEnum,
	type CharacterInterface,
	type ScoreInterface,
} from '@etnos/types';

export default function ProfilePage() {
	const {
		isLoading,
		isSyncingPushToken,
		isUpdatingNotifications,
		notificationsEnabled,
		setNotificationsEnabled,
		signOut,
		syncPushToken,
		updateProfile,
		user,
		refreshProfile,
	} = useAuth();
	const [childName, setChildName] = useState(user?.childName ?? '');
	const [parentName, setParentName] = useState(user?.parentName ?? '');

	const {
		data: characters,
		isLoading: isLoadingCharacters,
		refetch: refetchCharacters,
	} = useQuery({
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
		scoresQuery.data?.reduce(
			(sum: number, item: ScoreInterface) => sum + item.score,
			0,
		) ?? 0;

	const getCharacterBySlug = (slug: string) => {
		return characters?.find((item: CharacterInterface) => item.slug === slug);
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

	const handleToggleNotifications = async (enabled: boolean) => {
		try {
			await setNotificationsEnabled(enabled);
			Toast.show({
				type: 'success',
				text1: enabled
					? 'Notificações habilitadas'
					: 'Notificações desativadas',
				text2: enabled
					? 'Você receberá os avisos no aplicativo.'
					: 'Você não receberá novos avisos neste perfil.',
			});
		} catch {
			Toast.show({
				type: 'error',
				text1: 'Erro',
				text2: 'Não foi possível atualizar as notificações agora.',
			});
		}
	};

	const handleSyncPushToken = async () => {
		try {
			await syncPushToken();
			Toast.show({
				type: 'success',
				text1: 'Token salvo',
				text2: 'Este aparelho está pronto para receber notificações.',
			});
		} catch {
			Toast.show({
				type: 'error',
				text1: 'Erro',
				text2: 'Não foi possível salvar o token deste aparelho.',
			});
		}
	};

	const refetchProfile = async () => {
		await refreshProfile();
		await refetchCharacters();
		await scoresQuery.refetch();
	};

	return (
		<Screen
			refreshControl={
				<RefreshControl
					refreshing={isLoadingCharacters || isLoading}
					onRefresh={refetchProfile}
				/>
			}
		>
			<View style={tw`gap-4`}>
				<SectionCard style={tw`items-center`}>
					<Image
						source={{
							uri:
								user.photoURL ||
								`https://robohash.org/${encodeURIComponent(
									user.email ?? user.uid,
								)}`,
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

				<SectionCard>
					<LoadingState isLoading={isLoading}>
						<View style={tw`gap-6`}>
							<View style={tw`border-b border-slate-200 pb-4`}>
								<Text style={tw`text-sm font-bold uppercase text-primary`}>
									Escola
								</Text>
								<Text style={tw`text-lg font-black `} numberOfLines={1}>
									{user.schoolName ?? 'Não informado'}
								</Text>
							</View>
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
								disabled={isLoading}
								onPress={() => void handleSaveProfile()}
							/>
						</View>
					</LoadingState>
				</SectionCard>

				<SectionCard>
					<LoadingState
						isLoading={isUpdatingNotifications || isSyncingPushToken}
					>
						<View style={tw`gap-4`}>
							<View style={tw`flex-row items-center justify-between gap-4`}>
								<View style={tw`flex-1`}>
									<Text style={tw`text-lg font-black uppercase text-primary`}>
										Notificações
									</Text>
									<Text style={tw`mt-1 text-xs`}>
										Receber avisos e comunicados no app.
									</Text>
								</View>
								<Switch
									disabled={isUpdatingNotifications || isSyncingPushToken}
									onValueChange={(value) =>
										void handleToggleNotifications(value)
									}
									thumbColor={
										notificationsEnabled ? tw.color('white') : undefined
									}
									trackColor={{
										false: tw.color('stone-300'),
										true: tw.color('amber-500'),
									}}
									value={notificationsEnabled}
								/>
							</View>
							<View style={tw`rounded border border-slate-200 bg-slate-50 p-3`}>
								<Text style={tw`text-xs font-bold uppercase text-stone-500`}>
									Status do aparelho
								</Text>
								<Text style={tw`text-lg font-black uppercase text-primary`}>
									{user.hasPushToken ? 'Token salvo' : 'Token não salvo'}
								</Text>
								<Text style={tw`mt-1 text-xs text-stone-600`}>
									{user.hasPushToken
										? 'Este aparelho pode receber notificações.'
										: 'Salve o token deste aparelho para receber notificações.'}
								</Text>
								{user.expoPushToken ? (
									<Text style={tw`mt-2 text-xs text-stone-500`}>
										{user.expoPushToken}
									</Text>
								) : null}
								{notificationsEnabled && !user.hasPushToken ? (
									<View style={tw`mt-3`}>
										<PrimaryButton
											label="Salvar token deste aparelho"
											loading={isSyncingPushToken}
											disabled={isUpdatingNotifications}
											variant="secondary"
											onPress={() => void handleSyncPushToken()}
										/>
									</View>
								) : null}
							</View>
						</View>
					</LoadingState>
				</SectionCard>

				<SectionCard>
					<LoadingState isLoading={isLoading}>
						<AvatarSelector
							currentAvatarUrl={user.photoURL}
							currentCharacterSlug={user.avatarCharacterSlug}
							onPick={handlePickAvatar}
						/>
					</LoadingState>
				</SectionCard>

				<SectionCard>
					<Text style={tw`text-lg font-black uppercase text-primary`}>
						Pontuação
					</Text>
					<View style={tw`mt-4 gap-2`}>
						{scoresQuery.data?.length ? (
							scoresQuery.data.map((game) => (
								<View
									key={`${game.slug}-${game.characterSlug}`}
									style={tw`rounded border border-slate-200 bg-white flex-row items-center`}
								>
									<View style={tw`w-20 border-r border-slate-200`}>
										<Image
											source={{
												uri: getCharacterBySlug(game.characterSlug)?.imageUrl,
											}}
											style={tw`aspect-square w-full`}
											contentFit="contain"
										/>
									</View>
									<View style={tw`flex-1 p-3`}>
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
					variant="outlineDanger"
					onPress={() => void signOut()}
				/>
			</View>
		</Screen>
	);
}
