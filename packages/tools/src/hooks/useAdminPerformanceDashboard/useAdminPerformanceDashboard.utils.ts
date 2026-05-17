import {
	ADMIN_DASHBOARD_ALL_SCHOOLS,
	type SchoolAverageChartRow,
	type SchoolRankingInterface,
} from '@etnos/types';

const truncateSchoolName = (name: string, maxLength = 24) =>
	name.length > maxLength ? `${name.slice(0, maxLength - 1)}…` : name;

const toChartRow = (row: SchoolRankingInterface): SchoolAverageChartRow => ({
	key: row.schoolId,
	name: truncateSchoolName(row.schoolName),
	fullName: row.schoolName,
	media: row.averageScore,
});

export const buildSchoolAverageChartRows = (
	ranking: SchoolRankingInterface[],
	selectedSchoolId: string,
	allSchoolsValue: string = ADMIN_DASHBOARD_ALL_SCHOOLS,
): SchoolAverageChartRow[] => {
	const withPlayers = ranking.filter((row) => row.totalPlayers > 0);

	if (selectedSchoolId === allSchoolsValue) {
		return [...withPlayers]
			.sort((left, right) => right.averageScore - left.averageScore)
			.map(toChartRow);
	}

	const match = withPlayers.find((row) => row.schoolId === selectedSchoolId);
	return match ? [toChartRow(match)] : [];
};
