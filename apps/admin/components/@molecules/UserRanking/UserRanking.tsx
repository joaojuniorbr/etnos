import { Select, Table } from 'antd';
import type { UserRankingInterface } from '@etnos/types';
import { Title } from '@etnos/ui';

interface UserRankingProps {
	ranking: UserRankingInterface[];
	selectedGame: string;
	onGameChange: (game: string) => void;
	gameOptions: Array<{ value: string; label: string }>;
}

export const UserRanking = ({
	ranking,
	selectedGame,
	onGameChange,
	gameOptions,
}: UserRankingProps) => {
	return (
		<div className="border border-slate-200 p-6 rounded bg-white">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
				<div>
					<Title className="mb-1">Ranking por usuário</Title>
					<p className="text-slate-600 text-sm">
						Acompanhe a pontuação dos usuários da escola e filtre por jogo
						quando precisar.
					</p>
				</div>

				<Select
					value={selectedGame}
					onChange={onGameChange}
					options={gameOptions}
					className="w-full md:max-w-xs"
				/>
			</div>

			<Table
				rowKey={(record) => `${record.uid}-${record.gameSlug ?? 'all'}`}
				pagination={{ pageSize: 8 }}
				dataSource={ranking}
				columns={[
					{
						title: '#',
						dataIndex: 'position',
						width: 72,
					},
					{
						title: 'Aluno',
						dataIndex: 'childName',
						render: (value: string | null | undefined) => value || '-',
					},
					{
						title: 'Responsável',
						dataIndex: 'parentName',
						render: (value: string | null | undefined) => value || '-',
					},
					{
						title: 'E-mail',
						dataIndex: 'email',
						render: (value: string | null | undefined) => value || '-',
					},
					{
						title: 'Pontuação',
						dataIndex: 'totalScore',
					},
				]}
				locale={{
					emptyText: 'Nenhum dado de ranking disponível para este filtro.',
				}}
			/>
		</div>
	);
};
