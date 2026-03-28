'use client';

import { Button, Input, Table } from 'antd';
import type { SchoolUserInterface } from '@etnos/types';
import { Title } from '@etnos/ui';

interface SchoolUsersProps {
	users: SchoolUserInterface[];
	search: string;
	onSearchChange: (value: string) => void;
	onSendPassword: (email?: string | null) => Promise<void>;
	sendingRecoveryEmail: string | null;
}

export const SchoolUsers = ({
	users,
	search,
	onSearchChange,
	onSendPassword,
	sendingRecoveryEmail,
}: SchoolUsersProps) => {
	return (
		<div className='border border-slate-200 p-6 rounded bg-white'>
			<div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4'>
				<div>
					<Title className='mb-1'>Usuários da escola</Title>
					<p className='text-slate-600 text-sm'>
						Use a busca para localizar alunos ou responsáveis vinculados à sua
						escola.
					</p>
				</div>

				<Input.Search
					allowClear
					placeholder='Buscar por aluno, responsável ou e-mail'
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					className='w-full md:max-w-md'
				/>
			</div>

			<Table
				rowKey='uid'
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
	);
};
