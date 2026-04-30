'use client';

import { type ReactNode, useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Select, Table, Tag, TagProps, message } from 'antd';
import { schoolService, usersService, useAuth } from '@etnos/tools';
import type { SchoolUserInterface, UserRole } from '@etnos/types';
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
	const deferredUserSearch = useDeferredValue(userSearch.trim());

	const isAdmin = user?.role?.includes('admin');
	const isSchoolProfile = user?.role?.includes('school') && !isAdmin;
	const isTeacherProfile = user?.role?.includes('teacher') && !isAdmin;

	const { data: users = [], isLoading } = useQuery<SchoolUserInterface[]>({
		queryKey: ['schools', 'viewer', 'users', schoolId, deferredUserSearch],
		queryFn: () =>
			schoolService.getUsersBySchool(schoolId, deferredUserSearch || undefined),
		enabled: isSchoolProfile && Boolean(schoolId),
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

	if (isTeacherProfile) {
		return (
			<Card>
				<p className="text-slate-600">
					Seu perfil pode acompanhar o ranking, mas nao possui permissao para
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
					pagination={{ pageSize: 8 }}
					dataSource={users}
					columns={[
						{
							title: 'Dados',
							render: (record: SchoolUserInterface) => (
								<div className="flex flex-col gap-1">
									<div className="font-bold text-slate-600 text-sm">
										{record.childName}
									</div>
									<div className="text-xs truncate overflow-hidden text-ellipsis">
										{record.parentName}
									</div>
									<div className="text-xs truncate overflow-hidden text-ellipsis max-w-50">
										{record.email}
									</div>
									<div className="pt-1">{renderRoles(record)}</div>
									<div className="pt-1">
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
							title: 'Perfis',
							key: 'roles',
							width: 220,
							render: (_: unknown, record: SchoolUserInterface) =>
								renderRoles(record),
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
