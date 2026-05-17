import type { NotificationTargetType } from '@etnos/types';

export const targetTypeLabels: Record<NotificationTargetType, string> = {
	GLOBAL: 'Geral',
	SCHOOL: 'Escola',
	INDIVIDUAL: 'Individual',
};

export const targetTypeColors: Record<NotificationTargetType, string> = {
	GLOBAL: 'blue',
	SCHOOL: 'green',
	INDIVIDUAL: 'orange',
};
