export const ADMIN_DASHBOARD_ALL_SCHOOLS = 'all' as const;

export type SchoolAverageChartRow = {
	key: string;
	name: string;
	fullName: string;
	media: number;
};

export interface DashboardPieSliceInterface {
	key: string;
	label: string;
	value: number;
	percentage: number;
}

export interface AdminDashboardCharacterUsageInterface {
	slices: DashboardPieSliceInterface[];
	topCharacterSlug: string | null;
	topCharacterName: string | null;
	totalPlays: number;
}

export type AdminDashboardNpsViewMode = 'by_school' | 'by_rating';

export interface AdminDashboardNpsInterface {
	slices: DashboardPieSliceInterface[];
	totalResponses: number;
	averageRating: number | null;
	viewMode: AdminDashboardNpsViewMode;
}
