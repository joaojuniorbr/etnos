'use client';

import { type ReactNode, useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Input,
	Modal,
	Select,
	Table,
	Tag,
	TagProps,
	message,
} from 'antd';
import { schoolService, usersService, useAuth } from '@etnos/tools';
import {
	GameNameEnum,
	type ScoreHistory,
	type SchoolUserInterface,
	type UserRole,
} from '@etnos/types';
import { Card, Title } from '@etnos/ui';

const roleLabels: Record<Extract<UserRole, 'student' | 'teacher'>, string> = {
	student: 'Aluno',
	teacher: 'Professor',
};

interface RoleTagProps extends TagProps {
	value: string;
	label?: ReactNode;
}

const RoleTag = ({ value, label, closable, onClose }: RoleTagProps) => (
	<Tag closable={closable} onClose={onClose}>
		{roleLabels[value as 'student' | 'teacher'] ?? label}
	</Tag>
);

const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({
	value,
	label,
}));

const formatDateTimePtBr = (iso?: string | null) => {
	if (!iso) {
		return '—';
	}

	try {
		return new Intl.DateTimeFormat('pt-BR', {
			dateStyle: 'short',
			timeStyle: 'medium',
		}).format(new Date(iso));
	} catch {
		return '—';
	}
};

const gameDisplayName = (slug: string) =>
	GameNameEnum[slug as keyof typeof GameNameEnum] ?? slug;

const sessionStatusLabel = (status?: string) => {
	switch (status) {
		case 'completed':
			return 'Concluída';
		case 'in_progress':
			return 'Em andamento';
		case 'abandoned':
			return 'Encerrada (sem conclusão)';
		default:
			return status ?? '—';
	}
};

interface SchoolUsersProps {
	schoolId: string;
}

export const SchoolUsers = ({ schoolId }: SchoolUsersProps) => {
	const { user, onRecoveryPass } = useAuth();
	const queryClient = useQueryClient();
	const [userSearch, setUserSearch] = useState('');
	const [sendingRecoveryEmail, setSendingRecoveryEmail] = useState<
		string | null
	>(null);
	const [historyUser, setHistoryUser] = useState<SchoolUserInterface | null>(
		null,
	);
	const deferredUserSearch = useDeferredValue(userSearch.trim());

	const isAdmin = user?.role?.includes('admin');
	const isSchoolProfile = user?.role?.includes('school') && !isAdmin;
	const isTeacherProfile = user?.role?.includes('teacher') && !isAdmin;

	const canLoadSchoolUsers = (isSchoolProfile || isAdmin) && Boolean(schoolId);

	const { data: users = [], isLoading } = useQuery<SchoolUserInterface[]>({
		queryKey: ['schools', 'viewer', 'users', schoolId, deferredUserSearch],
		queryFn: () =>
			schoolService.getUsersBySchool(schoolId, deferredUserSearch || undefined),
		enabled: canLoadSchoolUsers,
	});

	const { data: gameHistory = [], isLoading: historyLoading } = useQuery<
		ScoreHistory[]
	>({
		queryKey: [
			'schools',
			schoolId,
			'user-game-score-history',
			historyUser?.uid,
		],
		queryFn: () =>
			schoolService.getUserGameScoreHistory(schoolId, historyUser?.uid ?? ''),
		enabled: Boolean(schoolId && historyUser?.uid),
	});

	const updateRolesMutation = useMutation({
		mutationFn: ({ userId, roles }: { userId: string; roles: UserRole[] }) =>
			usersService.update(userId, { roles }),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['schools', 'viewer', 'users'],
			});
			void queryClient.invalidateQueries({ queryKey: ['users', 'admin'] });
			message.success('Perfil do usuário atualizado com sucesso');
		},
		onError: () => {
			message.error('Erro ao atualizar perfil do usuário');
		},
	});

	const handleSendPassword = async (email?: string | null) => {
		if (!email) {
			message.error('Usuário sem e-mail para recuperação.');
			return;
		}
		setSendingRecoveryEmail(email);
		try {
			await onRecoveryPass(email);
		} finally {
			setSendingRecoveryEmail(null);
		}
	};

	const handleRolesChange = (userId: string, roles: UserRole[]) => {
		if (updateRolesMutation.isPending) return;
		updateRolesMutation.mutate({ userId, roles });
	};

	const historyColumns = [
		{
			title: 'Jogo',
			dataIndex: 'gameName',
			key: 'gameName',
			render: (slug: string) => gameDisplayName(slug),
		},
		{
			title: 'Personagem',
			dataIndex: 'characterName',
			key: 'characterName',
			render: (v: string | undefined) => v || '—',
		},
		{
			title: 'Início',
			key: 'startedAt',
			render: (_: unknown, row: ScoreHistory) =>
				formatDateTimePtBr(row.startedAt ?? row.timestamp),
		},
		{
			title: 'Fim',
			key: 'endedAt',
			render: (_: unknown, row: ScoreHistory) =>
				formatDateTimePtBr(row.endedAt),
		},
		{
			title: 'Pontos',
			dataIndex: 'score',
			key: 'score',
			align: 'right' as const,
		},
		{
			title: 'Situação',
			key: 'status',
			render: (_: unknown, row: ScoreHistory) => sessionStatusLabel(row.status),
		},
	];

	const renderOpenHistory = (record: SchoolUserInterface) => (
		<Button type="link" size="small" onClick={() => setHistoryUser(record)}>
			Ver partidas
		</Button>
	);

	if (isTeacherProfile) {
		return (
			<Card>
				<p className="text-slate-600">
					Seu perfil pode acompanhar o ranking, mas não possui permissão para
					gerenciar usuarios desta escola.
				</p>
			</Card>
		);
	}

	const renderRoles = (record: SchoolUserInterface) => {
		const userId = record.id;

		if (!userId) {
			return record.roles?.length ? (
				<div className="flex flex-wrap gap-1">
					{record.roles.map((role) => (
						<Tag key={role}>{role}</Tag>
					))}
				</div>
			) : (
				'-'
			);
		}

		const isCurrentUser = user?.uid === record.uid;
		const isUpdatingRoles =
			updateRolesMutation.isPending &&
			updateRolesMutation.variables?.userId === userId;

		return (
			<Select
				mode="multiple"
				value={
					(record.roles?.length
						? record.roles.filter((role) => role !== 'admin')
						: ['student']) as UserRole[]
				}
				options={roleOptions}
				className="w-full min-w-40"
				loading={isUpdatingRoles}
				disabled={isUpdatingRoles || isCurrentUser}
				onChange={(roles) => handleRolesChange(userId, roles)}
				tagRender={RoleTag}
			/>
		);
	};

	return (
		<Card>
			<Modal
				title={
					historyUser
						? `Partidas — ${
								historyUser.childName ?? historyUser.parentName ?? 'Usuário'
							}`
						: 'Histórico de partidas'
				}
				open={Boolean(historyUser)}
				onCancel={() => setHistoryUser(null)}
				footer={null}
				width={960}
				destroyOnHidden
			>
				<Table<ScoreHistory>
					rowKey={(row) =>
						row.id ?? `${row.timestamp}-${row.gameName}-${row.characterName}`
					}
					loading={historyLoading}
					dataSource={gameHistory}
					columns={historyColumns}
					pagination={{ pageSize: 10, showSizeChanger: true }}
					locale={{
						emptyText: 'Nenhuma partida registrada para este usuário.',
					}}
				/>
			</Modal>
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
				<div>
					<Title className="mb-1">Usuários da escola</Title>
					<p className="text-slate-600 text-sm">
						Use a busca para localizar alunos ou responsáveis vinculados à sua
						escola.
					</p>
				</div>

				<Input.Search
					allowClear
					placeholder="Buscar por aluno, responsável ou e-mail"
					value={userSearch}
					onChange={(e) => setUserSearch(e.target.value)}
					className="w-full md:max-w-md"
				/>
			</div>
			<div className="block md:hidden">
				<Table
					rowKey="uid"
					loading={isLoading}
					dataSource={users}
					columns={[
						{
							title: 'Dados',
							render: (record: SchoolUserInterface) => (
								<div className="flex flex-col gap-1">
									<button
										type="button"
										className="font-bold text-slate-600 text-sm text-left underline-offset-2 hover:underline"
										onClick={() => setHistoryUser(record)}
									>
										{record.childName || '—'}
									</button>
									<div className="text-xs truncate overflow-hidden text-ellipsis">
										{record.parentName}
									</div>
									<div className="text-xs truncate overflow-hidden text-ellipsis max-w-50">
										{record.email}
									</div>
									<div className="pt-1">{renderRoles(record)}</div>
									<div className="pt-1 flex flex-wrap gap-2 items-center">
										{renderOpenHistory(record)}
										<Button
											onClick={() => handleSendPassword(record.email)}
											loading={sendingRecoveryEmail === record.email}
											disabled={!record.email}
											size="small"
										>
											Enviar senha
										</Button>
									</div>
								</div>
							),
						},
					]}
					locale={{
						emptyText: 'Nenhum usuário encontrado para os filtros atuais.',
					}}
				/>
			</div>
			<div className="hidden md:block">
				<Table
					rowKey="uid"
					loading={isLoading}
					pagination={{ pageSize: 8 }}
					dataSource={users}
					columns={[
						{
							title: 'Aluno',
							dataIndex: 'childName',
							render: (value: string | null | undefined, record) => (
								<Button
									type="link"
									className="p-0 h-auto font-semibold"
									onClick={() => setHistoryUser(record)}
								>
									{value || '—'}
								</Button>
							),
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
							title: 'Perfis',
							key: 'roles',
							width: 220,
							render: (_: unknown, record: SchoolUserInterface) =>
								renderRoles(record),
						},
						{
							title: 'Partidas',
							key: 'history',
							width: 130,
							render: (_: unknown, record: SchoolUserInterface) =>
								renderOpenHistory(record),
						},
						{
							title: 'Ação',
							key: 'action',
							render: (_: unknown, record: SchoolUserInterface) => (
								<Button
									onClick={() => handleSendPassword(record.email)}
									loading={sendingRecoveryEmail === record.email}
									disabled={!record.email}
								>
									Enviar senha
								</Button>
							),
						},
					]}
					locale={{
						emptyText: 'Nenhum usuário encontrado para os filtros atuais.',
					}}
				/>
			</div>
		</Card>
	);
};
