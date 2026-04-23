'use client';

import { Button, Input, Select, Table, Tag } from 'antd';
import type { SchoolUserInterface, UserRole } from '@etnos/types';
import { Card, Title } from '@etnos/ui';

const roleLabels: Record<Extract<UserRole, 'student' | 'teacher'>, string> = {
	student: 'Aluno',
	teacher: 'Professor',
};

const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({
	value,
	label,
}));

interface SchoolUsersProps {
	users: SchoolUserInterface[];
	search: string;
	onSearchChange: (value: string) => void;
	onSendPassword: (email?: string | null) => Promise<void>;
	sendingRecoveryEmail: string | null;
	currentUserUid?: string;
	onRolesChange?: (userId: string, roles: UserRole[]) => void;
	updatingRolesUserId?: string | null;
}

export const SchoolUsers = ({
	users,
	search,
	onSearchChange,
	onSendPassword,
	sendingRecoveryEmail,
	currentUserUid,
	onRolesChange,
	updatingRolesUserId,
}: SchoolUsersProps) => {
	const renderRoles = (record: SchoolUserInterface) => {
		if (!onRolesChange || !record.id) {
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

		const userId = record.id;
		const isCurrentUser = currentUserUid === record.uid;
		const isUpdatingRoles = updatingRolesUserId === userId;

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
				onChange={(roles) => onRolesChange(userId, roles as UserRole[])}
				tagRender={(tagProps) => (
					<Tag closable={tagProps.closable} onClose={tagProps.onClose}>
						{roleLabels[tagProps.value as 'student' | 'teacher'] ??
							tagProps.label}
					</Tag>
				)}
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
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					className="w-full md:max-w-md"
				/>
			</div>

			<div className="block md:hidden">
				<Table
					rowKey="uid"
					pagination={{ pageSize: 8 }}
					dataSource={users}
					columns={[
						{
							title: 'Dados',
							render: (record) => (
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
											onClick={() => onSendPassword(record.email)}
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
						emptyText: 'Nenhum dado de ranking disponível para este filtro.',
					}}
				/>
			</div>

			<div className="hidden md:block">
				<Table
					rowKey="uid"
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
							render: (_, record: SchoolUserInterface) => renderRoles(record),
						},
						{
							title: 'Ação',
							key: 'action',
							render: (_, record: SchoolUserInterface) => (
								<Button
									onClick={() => onSendPassword(record.email)}
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
