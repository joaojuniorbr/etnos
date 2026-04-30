'use client';

import { useEffect, useState } from 'react';
import { Button, Checkbox, Empty, Tag, Image } from 'antd';
import { Card, Title } from '@etnos/ui';
import { useCharacter } from '@etnos/tools';

interface Option {
	value: string;
	label: string;
}

interface SchoolGameAccessProps {
	schoolName?: string | null;
	gameOptions: Option[];
	enabledGameSlugs: string[];
	enabledCharacterSlugs: string[];
	hasCustomGames: boolean;
	hasCustomCharacters: boolean;
	canEdit: boolean;
	isSaving?: boolean;
	onSave: (payload: {
		enabledGameSlugs: string[];
		enabledCharacterSlugs: string[];
	}) => void;
	onResetToDefault: () => void;
}

export const SchoolGameAccess = ({
	schoolName,
	gameOptions,
	enabledGameSlugs,
	enabledCharacterSlugs,
	hasCustomGames,
	hasCustomCharacters,
	canEdit,
	isSaving = false,
	onSave,
	onResetToDefault,
}: SchoolGameAccessProps) => {
	const [selectedGameSlugs, setSelectedGameSlugs] =
		useState<string[]>(enabledGameSlugs);
	const [selectedCharacterSlugs, setSelectedCharacterSlugs] = useState<
		string[]
	>(enabledCharacterSlugs);

	const { data: characters } = useCharacter();

	useEffect(() => {
		setSelectedGameSlugs(enabledGameSlugs);
	}, [enabledGameSlugs]);

	useEffect(() => {
		setSelectedCharacterSlugs(enabledCharacterSlugs);
	}, [enabledCharacterSlugs]);

	const hasChanges =
		selectedGameSlugs.join('|') !== enabledGameSlugs.join('|') ||
		selectedCharacterSlugs.join('|') !== enabledCharacterSlugs.join('|');

	return (
		<Card>
			<div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
				<div>
					<Title className="mb-1">Jogos e personagens habilitados</Title>
					<p className="text-sm">
						Escolha o que fica disponível para {schoolName || 'esta escola'} no
						app do estudante.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<Tag
						color={hasCustomGames || hasCustomCharacters ? 'blue' : 'default'}
					>
						{hasCustomGames || hasCustomCharacters
							? 'Configuração personalizada'
							: 'Usando padrão da plataforma'}
					</Tag>
					<Tag>{selectedGameSlugs.length} jogos</Tag>
					<Tag>{selectedCharacterSlugs.length} personagens</Tag>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
				<div>
					<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
						Jogos
					</h3>
					{gameOptions.length ? (
						<Checkbox.Group
							value={selectedGameSlugs}
							onChange={(values) => setSelectedGameSlugs(values)}
							disabled={!canEdit || isSaving}
							className="flex w-full flex-col gap-3"
						>
							{gameOptions.map((option) => (
								<label
									key={option.value}
									className="flex items-center gap-3 rounded border border-slate-200 px-4 py-3"
								>
									<Checkbox value={option.value} />
									<span className="font-medium text-slate-800">
										{option.label}
									</span>
								</label>
							))}
						</Checkbox.Group>
					) : (
						<Empty description="Nenhum jogo disponível." />
					)}
				</div>

				<div>
					<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
						Personagens
					</h3>
					{characters?.length ? (
						<Checkbox.Group
							value={selectedCharacterSlugs}
							onChange={(values) => setSelectedCharacterSlugs(values)}
							disabled={!canEdit || isSaving}
						>
							{characters.map((option) => (
								<label
									key={option.slug}
									className="flex flex-col gap-2 rounded border border-slate-200 mb-2"
								>
									<div className="w-32">
										{option.avatarUrls && (
											<Image
												src={option.imageUrl}
												alt={option.name}
												className="aspect-square w-full"
												preview={false}
											/>
										)}
									</div>
									<div className="flex items-center gap-1 p-2">
										<Checkbox value={option.slug} />
										<span className="font-medium text-slate-800 text-xs">
											{option.name}
										</span>
									</div>
								</label>
							))}
						</Checkbox.Group>
					) : (
						<Empty description="Nenhum personagem cadastrado." />
					)}
				</div>
			</div>

			<div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end">
				<Button
					onClick={onResetToDefault}
					disabled={
						!canEdit || isSaving || (!hasCustomGames && !hasCustomCharacters)
					}
				>
					Usar padrão da plataforma
				</Button>
				<Button
					type="primary"
					loading={isSaving}
					disabled={!canEdit || isSaving || !hasChanges}
					onClick={() =>
						onSave({
							enabledGameSlugs: selectedGameSlugs,
							enabledCharacterSlugs: selectedCharacterSlugs,
						})
					}
				>
					Salvar configuração
				</Button>
			</div>
		</Card>
	);
};
