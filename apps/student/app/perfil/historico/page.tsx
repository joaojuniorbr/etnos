'use client';

import { Breadcrumb } from 'antd';
import { useState } from 'react';
import { Title } from '@etnos/ui';
import { GameFilter } from '@/components/@molecules';
import { ScoreHistoryList } from '@/components/@organisms';
import { useScoreHistory } from '@/hooks';

export default function HistoricoPage() {
	const [gameSlug, setGameSlug] = useState<string>();
	const { data: history, isLoading, isError } = useScoreHistory(gameSlug);

	return (
		<div className="container mx-auto py-4 px-6 md:py-10 md:px-0">
			<Breadcrumb
				items={[
					{ title: 'Home', href: '/' },
					{
						title: 'Área do estudante',
						href: '/estudante',
					},
					{
						title: 'Perfil',
						href: '/estudante/perfil',
					},
					{
						title: 'Histórico de Pontuação',
					},
				]}
			/>

			<div className="mt-8 mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
				<div>
					<Title>Histórico de Pontuação</Title>
					<p className="text-slate-600">
						Acompanhe seu desempenho em todos os jogos que você participou.
					</p>
				</div>

				<GameFilter value={gameSlug} onChange={setGameSlug} />
			</div>

			<ScoreHistoryList
				history={history}
				isLoading={isLoading}
				isError={isError}
			/>
		</div>
	);
}
