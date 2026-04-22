import { Select, Table } from 'antd';
import type { UserRankingInterface } from '@etnos/types';
import { Card, Title } from '@etnos/ui';

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
		<Card>
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

			<div className="block md:hidden">
				<Table
					rowKey={(record) => `${record.uid}-${record.gameSlug ?? 'all'}`}
					pagination={{ pageSize: 8 }}
					dataSource={ranking}
					columns={[
						{
							title: '#',
							dataIndex: 'position',
							width: 40,
						},
						{
							title: 'Dados',
							render: (record) => (
								<div className="flex flex-col gap-0.5">
									<div className="font-bold text-slate-600 text-sm">
										{record.childName}
									</div>
									<div className="text-xs truncate overflow-hidden text-ellipsis">
										{record.parentName}
									</div>
								</div>
							),
						},
						{
							title: 'Pontuação',
							dataIndex: 'totalScore',
							render: (value: string | null | undefined) => (
								<div className="text-right">{value || '-'}</div>
							),
						},
					]}
					locale={{
						emptyText: 'Nenhum dado de ranking disponível para este filtro.',
					}}
				/>
			</div>

			<div className="hidden md:block">
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
		</Card>
	);
};
