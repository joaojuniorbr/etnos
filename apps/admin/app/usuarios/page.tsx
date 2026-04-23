'use client';

import { useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Breadcrumb,
	Input,
	Select,
	Spin,
	Switch,
	Table,
	Tag,
	message,
} from 'antd';
import type {
	AdminUserInterface,
	UpdateAdminUserPayload,
	UserRole,
} from '@etnos/types';
import { schoolService, usersService, useAuth } from '@etnos/tools';
import { AuthProtected, Title } from '@etnos/ui';

const roleLabels: Record<UserRole, string> = {
	admin: 'Administrador',
	school: 'Admin escola',
	student: 'Aluno',
	teacher: 'Professor',
};

const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({
	value,
	label,
}));

const formatDate = (value: string | Date) =>
	new Intl.DateTimeFormat('pt-BR', {
		dateStyle: 'short',
		timeStyle: 'short',
	}).format(new Date(value));

export default function UsuariosPage() {
	const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');
	const [search, setSearch] = useState('');
	const deferredSearch = useDeferredValue(search.trim());
	const queryClient = useQueryClient();
	const { user } = useAuth();

	const { data: schools = [], isLoading: isLoadingSchools } = useQuery({
		queryKey: ['schools', 'admin'],
		queryFn: () => schoolService.getAll(),
	});

	const { data: users = [], isLoading: isLoadingUsers } = useQuery({
		queryKey: [
			'users',
			'admin',
			selectedSchoolId,
			deferredSearch || 'all',
		],
		queryFn: () =>
			usersService.getAll({
				schoolId: selectedSchoolId === 'all' ? undefined : selectedSchoolId,
				search: deferredSearch || undefined,
			}),
	});

	const updateUserMutation = useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateAdminUserPayload;
		}) => usersService.update(id, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['users', 'admin'] });
			message.success('Usuário atualizado com sucesso.');
		},
		onError: () => {
			message.error('Erro ao atualizar usuário.');
		},
	});

	const updateUser = (id: string, payload: UpdateAdminUserPayload) => {
		if (updateUserMutation.isPending) {
			return;
		}

		updateUserMutation.mutate({ id, payload });
	};

	const isCurrentUser = (record: AdminUserInterface) => record.uid === user?.uid;

	const schoolOptions = [
		{ value: 'all', label: 'Todas as escolas' },
		...schools.map((school) => ({
			value: school.id,
			label: school.name,
		})),
	];

	return (
		<AuthProtected allowedRoles={['admin']} forbiddenRedirectTo="/admin">
			<Spin
				spinning={
					isLoadingSchools || isLoadingUsers || updateUserMutation.isPending
				}
			>
				<div className="container mx-auto px-6 py-4 md:py-10 md:px-0">
					<Breadcrumb
						items={[
							{ title: 'Home', href: '/' },
							{ title: 'Área do administrador', href: '/admin' },
							{ title: 'Usuários' },
						]}
					/>

					<Title className="mb-4 mt-6">Usuários</Title>
					<p className="mb-6 text-sm text-slate-600">
						Liste todos os usuários, confira UID e criação da conta, filtre por
						escola e ajuste perfil, vínculo ou status de acesso.
					</p>

					<div className="mb-6 grid gap-3 md:grid-cols-[minmax(220px,320px)_1fr]">
						<Select
							value={selectedSchoolId}
							options={schoolOptions}
							onChange={setSelectedSchoolId}
						/>
						<Input.Search
							allowClear
							placeholder="Buscar por nome, e-mail ou UID"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
					</div>

					<Table
						rowKey="id"
						dataSource={users}
						pagination={{ pageSize: 10 }}
						scroll={{ x: 1100 }}
						columns={[
							{
								title: 'Usuário',
								width: 220,
								render: (_, record: AdminUserInterface) => (
									<div>
										<div className="font-bold">
											{record.childName ||
												record.parentName ||
												record.email ||
												'Sem nome'}
										</div>
										<div className="text-xs text-slate-500">{record.email}</div>
									</div>
								),
							},
							{
								title: 'UID',
								dataIndex: 'uid',
								width: 260,
								render: (uid: string) => (
									<code className="break-all text-xs">{uid}</code>
								),
							},
							{
								title: 'Criado em',
								dataIndex: 'createdAt',
								width: 150,
								render: (createdAt: string | Date) => formatDate(createdAt),
							},
							{
								title: 'Escola',
								width: 260,
								render: (_, record: AdminUserInterface) => (
									<Select
										allowClear
										placeholder="Sem escola"
										value={record.school ?? undefined}
										options={schools.map((school) => ({
											value: school.id,
											label: school.name,
										}))}
										className="w-full"
										disabled={isCurrentUser(record)}
										onChange={(school) =>
											updateUser(record.id, { school: school ?? null })
										}
									/>
								),
							},
							{
								title: 'Perfis',
								width: 300,
								render: (_, record: AdminUserInterface) => (
									<Select
										mode="multiple"
										value={record.roles}
										options={roleOptions}
										className="w-full"
										disabled={isCurrentUser(record)}
										onChange={(roles) =>
											updateUser(record.id, {
												roles: roles as UserRole[],
											})
										}
										tagRender={(tagProps) => (
											<Tag closable={tagProps.closable} onClose={tagProps.onClose}>
												{roleLabels[tagProps.value as UserRole] ?? tagProps.label}
											</Tag>
										)}
									/>
								),
							},
							{
								title: 'Status',
								width: 120,
								render: (_, record: AdminUserInterface) => (
									<Switch
										checked={record.isActive}
										checkedChildren="Ativo"
										unCheckedChildren="Inativo"
										disabled={isCurrentUser(record)}
										onChange={(isActive) =>
											updateUser(record.id, { isActive })
										}
									/>
								),
							},
						]}
					/>
				</div>
			</Spin>
		</AuthProtected>
	);
}
