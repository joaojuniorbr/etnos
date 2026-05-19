'use client';

import { Spin } from 'antd';
import { StudentDashboard } from '@etnos/ui';
import { useCharacter, useStudentDashboard } from '@etnos/tools';

export const StudentHome = () => {
	const { selectedCharacter } = useCharacter({ fetchList: false });
	const { data, isLoading, isError } = useStudentDashboard(
		selectedCharacter?.slug,
	);

	if (isLoading) {
		return (
			<div className="flex justify-center py-20">
				<Spin size="large" />
			</div>
		);
	}

	if (isError || !data) {
		return (
			<p className="text-center text-slate-600 py-12">
				Não foi possível carregar seu painel. Tente novamente em instantes.
			</p>
		);
	}

	return <StudentDashboard data={data} />;
};
