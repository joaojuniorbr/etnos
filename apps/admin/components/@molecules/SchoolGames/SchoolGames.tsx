'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Spin, message } from 'antd';
import { schoolService, useAuth } from '@etnos/tools';
import {
	GameNameEnum,
	GamesEnum,
	type SchoolGameAccessInterface,
	type UpdateSchoolGameAccessPayload,
} from '@etnos/types';
import { SchoolGameAccess } from '../SchoolGameAccess';

interface SchoolGamesProps {
	schoolId: string;
	schoolName?: string;
}

export const SchoolGames = ({ schoolId, schoolName }: SchoolGamesProps) => {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	const isAdmin = user?.role?.includes('admin');
	const isTeacherProfile = user?.role?.includes('teacher') && !isAdmin;

	const gameOptions = Object.values(GamesEnum).map((gameSlug) => ({
		value: gameSlug,
		label: GameNameEnum[gameSlug],
	}));

	const { data: schoolGameAccess, isLoading } = useQuery<SchoolGameAccessInterface>({
		queryKey: ['schools', 'game-access', schoolId],
		queryFn: () => schoolService.getGameAccessBySchool(schoolId),
		enabled: Boolean(schoolId),
	});

	const updateMutation = useMutation({
		mutationFn: (payload: UpdateSchoolGameAccessPayload) =>
			schoolService.updateGameAccessBySchool(schoolId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['schools', 'game-access'] });
			message.success('Configuração da escola atualizada com sucesso');
		},
		onError: () => {
			message.error('Erro ao atualizar configuração da escola');
		},
	});

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
			isSaving={updateMutation.isPending}
			onSave={(payload) => updateMutation.mutate(payload)}
			onResetToDefault={() =>
				updateMutation.mutate({ enabledGameSlugs: [], enabledCharacterSlugs: [] })
			}
		/>
	);
};
