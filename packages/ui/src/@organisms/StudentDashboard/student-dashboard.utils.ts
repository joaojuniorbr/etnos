export function formatDashboardScore(value: number): string {
	return value.toLocaleString('pt-BR');
}

export function formatClassRank(rank: number | null): string {
	if (!rank) {
		return '—';
	}

	return `${rank}º`;
}

export function formatRelativeTime(timestamp: string): string {
	const date = new Date(timestamp);
	const now = new Date();
	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);
	const startOfYesterday = new Date(startOfToday);
	startOfYesterday.setDate(startOfYesterday.getDate() - 1);

	if (date >= startOfToday) {
		return 'Hoje';
	}

	if (date >= startOfYesterday) {
		return 'Ontem';
	}

	const diffDays = Math.floor(
		(startOfToday.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffDays < 7) {
		return `${diffDays} dias`;
	}

	return date.toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: 'short',
	});
}
