export type SchoolAverageChartRow = {
	key: string;
	name: string;
	fullName: string;
	media: number;
};

export const DASHBOARD_PIE_COLORS = [
	'#2563eb',
	'#7c3aed',
	'#db2777',
	'#ea580c',
	'#16a34a',
	'#0891b2',
	'#4f46e5',
	'#ca8a04',
] as const;
