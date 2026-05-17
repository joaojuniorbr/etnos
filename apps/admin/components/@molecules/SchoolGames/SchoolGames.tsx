'use client';

import { Spin, message } from 'antd';
import { useAuth, useSchoolGameAccess, useSchoolMutations } from '@etnos/tools';
import {
	GameNameEnum,
	GamesEnum,
	type UpdateSchoolGameAccessPayload,
} from '@etnos/types';
import { SchoolGameAccess } from '..';

interface SchoolGamesProps {
	schoolId: string;
	schoolName?: string;
}

export const SchoolGames = ({ schoolId, schoolName }: SchoolGamesProps) => {
	const { user } = useAuth();
	const { updateSchoolGameAccess } = useSchoolMutations();

	const isAdmin = user?.role?.includes('admin');
	const isTeacherProfile = user?.role?.includes('teacher') && !isAdmin;

	const gameOptions = Object.values(GamesEnum).map((gameSlug) => ({
		value: gameSlug,
		label: GameNameEnum[gameSlug],
	}));

	const { data: schoolGameAccess, isLoading } = useSchoolGameAccess(schoolId, {
		enabled: Boolean(schoolId),
	});

	const handleSave = (payload: UpdateSchoolGameAccessPayload) => {
		updateSchoolGameAccess.mutate(
			{ schoolId, payload },
			{
				onSuccess: () => {
					message.success('Configuração da escola atualizada com sucesso');
				},
				onError: () => {
					message.error('Erro ao atualizar configuração da escola');
				},
			},
		);
	};

	if (isLoading) return <Spin className="mt-4 block" />;
	if (!schoolGameAccess) return null;

	const canEdit = Boolean(schoolGameAccess.canEdit && !isTeacherProfile);

	return (
		<SchoolGameAccess
			schoolName={schoolName}
			gameOptions={gameOptions}
			enabledGameSlugs={schoolGameAccess.enabledGameSlugs}
			enabledCharacterSlugs={schoolGameAccess.enabledCharacterSlugs}
			hasCustomGames={schoolGameAccess.hasCustomGames}
			hasCustomCharacters={schoolGameAccess.hasCustomCharacters}
			canEdit={canEdit}
			isSaving={updateSchoolGameAccess.isPending}
			onSave={handleSave}
			onResetToDefault={() =>
				handleSave({ enabledGameSlugs: [], enabledCharacterSlugs: [] })
			}
		/>
	);
};
