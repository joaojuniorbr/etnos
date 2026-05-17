'use client';

import { type ReactNode, useDeferredValue, useState } from 'react';
import { Button, Input, Select, Table, Tag, TagProps, message } from 'antd';
import {
	useAuth,
	useSchoolUsersBySchool,
	useUpdateUserRolesMutation,
} from '@etnos/tools';
import type { SchoolUserInterface, UserRole } from '@etnos/types';
import { Card, Title } from '@etnos/ui';
import { SchoolUsersGameHistoryModal } from './SchoolUsersGameHistoryModal';
import { roleLabels, roleOptions } from './utils';

interface RoleTagProps extends TagProps {
	value: string;
	label?: ReactNode;
}

const RoleTag = ({ value, label, closable, onClose }: RoleTagProps) => (
	<Tag closable={closable} onClose={onClose}>
		{roleLabels[value as keyof typeof roleLabels] ?? label}
	</Tag>
);

interface SchoolUsersProps {
	schoolId: string;
}

export const SchoolUsers = ({ schoolId }: SchoolUsersProps) => {
	const { user, onRecoveryPass } = useAuth();
	const updateRolesMutation = useUpdateUserRolesMutation();

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

	const { data: users = [], isLoading } = useSchoolUsersBySchool(
		schoolId,
		deferredUserSearch,
		{ enabled: canLoadSchoolUsers },
	);

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
		updateRolesMutation.mutate(
			{ userId, roles },
			{
				onSuccess: () => {
					message.success('Perfil do usuário atualizado com sucesso');
				},
				onError: () => {
					message.error('Erro ao atualizar perfil do usuário');
				},
			},
		);
	};

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
			<SchoolUsersGameHistoryModal
				schoolId={schoolId}
				user={historyUser}
				onClose={() => setHistoryUser(null)}
			/>

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
					onChange={(event) => setUserSearch(event.target.value)}
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
