import { GameNameEnum } from '@etnos/types';

export const roleLabels = {
	student: 'Aluno',
	teacher: 'Professor',
} as const;

export const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({
	value,
	label,
}));

export const formatDateTimePtBr = (iso?: string | null) => {
	if (!iso) {
		return '—';
	}

	try {
		return new Intl.DateTimeFormat('pt-BR', {
			dateStyle: 'short',
			timeStyle: 'medium',
		}).format(new Date(iso));
	} catch {
		return '—';
	}
};

export const gameDisplayName = (slug: string) =>
	GameNameEnum[slug as keyof typeof GameNameEnum] ?? slug;

export const sessionStatusLabel = (status?: string) => {
	switch (status) {
		case 'completed':
			return 'Concluída';
		case 'in_progress':
			return 'Em andamento';
		case 'abandoned':
			return 'Encerrada (sem conclusão)';
		default:
			return status ?? '—';
	}
};
