'use client';

import { Button, Input, Table, Tag } from 'antd';
import type { SchoolUserInterface } from '@etnos/types';
import { Title } from '@etnos/ui';

interface SchoolAccessPanelProps {
	schoolAccessEmail: string;
	onSchoolAccessEmailChange: (email: string) => void;
	onAddAccess: () => void;
	isAdding: boolean;
	isRemoving: boolean;
	removingUserId?: string;
	users: SchoolUserInterface[];
	onRemoveAccess: (userId?: string) => void;
	disabled?: boolean;
}

export const SchoolAccessPanel = ({
	schoolAccessEmail,
	onSchoolAccessEmailChange,
	onAddAccess,
	isAdding,
	isRemoving,
	removingUserId,
	users,
	onRemoveAccess,
	disabled,
}: SchoolAccessPanelProps) => (
	<div>
		<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
			<div>
				<Title className="mb-1">Acessos ao painel da escola</Title>
				<p className="text-slate-600 text-sm">
					Defina quais perfis com role <code>school</code> podem visualizar a
					escola selecionada. Se o e-mail ainda não existir, o usuário será
					cadastrado automaticamente.
				</p>
			</div>

			<div className="flex w-full flex-col gap-2 md:max-w-xl md:flex-row">
				<Input
					placeholder="email@escola.com"
					value={schoolAccessEmail}
					onChange={(event) => onSchoolAccessEmailChange(event.target.value)}
				/>
				<Button
					type="primary"
					onClick={onAddAccess}
					loading={isAdding}
					disabled={disabled}
				>
					Adicionar e-mail
				</Button>
			</div>
		</div>

		<Table
			rowKey="uid"
			pagination={{ pageSize: 8 }}
			dataSource={users}
			columns={[
				{
					title: 'Usuário',
					render: (_, record: SchoolUserInterface) =>
						record.childName || record.parentName || record.email || '-',
				},
				{
					title: 'E-mail',
					dataIndex: 'email',
					render: (value: string | null | undefined) => value || '-',
				},
				{
					title: 'Perfis',
					dataIndex: 'roles',
					render: (roles: string[] | undefined) =>
						roles?.length ? (
							<div className="flex flex-wrap gap-1">
								{roles.map((role) => (
									<Tag key={role}>{role}</Tag>
								))}
							</div>
						) : (
							'-'
						),
				},
				{
					title: 'Ações',
					key: 'action',
					render: (_, record: SchoolUserInterface) => (
						<Button
							danger
							onClick={() => onRemoveAccess(record.id)}
							loading={isRemoving && removingUserId === record.id}
						>
							Remover
						</Button>
					),
				},
			]}
			locale={{
				emptyText: 'Nenhum perfil school foi vinculado à escola selecionada.',
			}}
		/>
	</div>
);
