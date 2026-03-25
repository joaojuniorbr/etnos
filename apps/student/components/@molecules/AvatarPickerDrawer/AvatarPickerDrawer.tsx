'use client';

import { useQuery } from '@tanstack/react-query';
import { Image, Spin } from 'antd';
import { charactersService } from '@etnos/tools';
import type {
	CharacterInterface,
	MidiaInterface,
	UserProfileInterface,
} from '@etnos/types';
import { useState } from 'react';

interface AvatarPickerDrawerProps {
	user: UserProfileInterface;
	onClose: () => void;
	onSaveAvatar: (avatarUrl: string, characterSlug: string) => Promise<void>;
}

export const AvatarPickerDrawer = ({
	user,
	onClose,
	onSaveAvatar,
}: AvatarPickerDrawerProps) => {
	const [isSaving, setIsSaving] = useState(false);
	const [selectedCharacterSlug, setSelectedCharacterSlug] = useState(
		user.avatarCharacterSlug || ''
	);

	const {
		data: characters = [],
		isLoading: isLoadingCharacters,
		error: charactersError,
	} = useQuery<CharacterInterface[]>({
		queryKey: ['profile-avatar-characters'],
		queryFn: () => charactersService.getCharacters(),
	});

	const {
		data: avatars = [],
		isLoading: isLoadingAvatars,
		error: avatarsError,
	} = useQuery<MidiaInterface[]>({
		queryKey: ['profile-avatar-list', selectedCharacterSlug],
		enabled: !!selectedCharacterSlug,
		queryFn: () => charactersService.getCharacterAvatars(selectedCharacterSlug),
	});

	const isLoading = isLoadingCharacters || isLoadingAvatars;

	const handleSelectAvatar = async (avatarUrl: string) => {
		if (!selectedCharacterSlug) {
			return;
		}

		setIsSaving(true);

		try {
			await onSaveAvatar(avatarUrl, selectedCharacterSlug);
			onClose();
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Spin spinning={isLoading || isSaving}>
			<div className='flex flex-col gap-6'>
				<div>
					<h3 className='text-lg font-bold text-primary mb-2'>Personagens</h3>
					<p className='text-sm text-slate-500'>
						Escolha um personagem para ver os avatares disponíveis.
					</p>
				</div>

				{charactersError ? (
					<p className='text-sm text-slate-500'>
						Não foi possível carregar os personagens.
					</p>
				) : (
					<div className='grid grid-cols-2 gap-4 md:grid-cols-5'>
						{characters.map((character) => {
							const isSelected = selectedCharacterSlug === character.slug;

							return (
								<button
									key={character.slug}
									type='button'
									onClick={() => setSelectedCharacterSlug(character.slug)}
									className={`rounded border p-3 text-left transition ${
										isSelected
											? 'border-primary ring-2 ring-primary/20'
											: 'border-slate-200'
									}`}
								>
									<Image
										src={character.imageUrl}
										alt={character.name}
										preview={false}
										className='aspect-square object-cover rounded mb-3 w-full'
									/>
									<div className='text-sm font-bold text-primary'>
										{character.name}
									</div>
									<div className='text-xs text-slate-500'>
										{character.region}
									</div>
								</button>
							);
						})}
					</div>
				)}

				<div>
					<h3 className='text-lg font-bold text-primary mb-2'>Avatares</h3>
					<p className='text-sm text-slate-500'>
						Selecione uma imagem para salvar no seu perfil.
					</p>
				</div>

				{selectedCharacterSlug ? (
					<div className='grid grid-cols-2 gap-4 md:grid-cols-5'>
						{avatars.map((avatar) => {
							const isSelected = user.photoURL === avatar.url;

							return (
								<button
									key={avatar.id || avatar.url}
									type='button'
									onClick={() => handleSelectAvatar(avatar.url)}
									className={`rounded border overflow-hidden flex w-full ${
										isSelected ? 'border-primary border-2' : 'border-none'
									}`}
								>
									<Image
										src={avatar.url}
										alt='Avatar do personagem'
										preview={false}
										className='aspect-square object-cover'
									/>
								</button>
							);
						})}
					</div>
				) : (
					<p className='text-sm text-slate-500'>
						Selecione um personagem para visualizar os avatares.
					</p>
				)}

				{selectedCharacterSlug &&
					!avatars.length &&
					!isLoading &&
					!avatarsError && (
						<p className='text-sm text-slate-500'>
							Ainda não existem avatares cadastrados para este personagem.
						</p>
					)}
			</div>
		</Spin>
	);
};
