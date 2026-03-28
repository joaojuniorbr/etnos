import { Select, Table } from 'antd';
import type { SchoolRankingInterface } from '@etnos/types';
import { Title } from '@etnos/ui';

interface SchoolRankingProps {
	ranking: SchoolRankingInterface[];
	selectedGame: string;
	onGameChange: (game: string) => void;
	gameOptions: Array<{ value: string; label: string }>;
}

export const SchoolRanking = ({
	ranking,
	selectedGame,
	onGameChange,
	gameOptions,
}: SchoolRankingProps) => {
	return (
		<div className='border border-slate-200 p-6 rounded bg-white'>
			<div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4'>
				<div>
					<Title className='mb-1'>Ranking por escola</Title>
					<p className='text-slate-600 text-sm'>
						Veja o desempenho acumulado das escolas e filtre por jogo quando
						quiser.
					</p>
				</div>

				<Select
					value={selectedGame}
					onChange={onGameChange}
					options={gameOptions}
					className='w-full md:max-w-xs'
				/>
			</div>

			<Table
				rowKey={(record) => `${record.schoolId}-${record.gameSlug ?? 'all'}`}
				pagination={{ pageSize: 8 }}
				dataSource={ranking}
				columns={[
					{
						title: '#',
						dataIndex: 'position',
						width: 72,
					},
					{
						title: 'Escola',
						dataIndex: 'schoolName',
					},
					{
						title: 'Jogadores',
						dataIndex: 'totalPlayers',
					},
					{
						title: 'Pontuação total',
						dataIndex: 'totalScore',
					},
					{
						title: 'Média',
						dataIndex: 'averageScore',
					},
				]}
				locale={{
					emptyText: 'Nenhum dado de ranking disponível para este filtro.',
				}}
			/>
		</div>
	);
};
