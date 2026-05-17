'use client';

import { useState } from 'react';
import {
	Breadcrumb,
	Button,
	Drawer,
	FloatButton,
	Form,
	Input,
	Select,
	Spin,
	Table,
	Tabs,
	Typography,
	message,
} from 'antd';
import {
	useAuth,
	useManagedSchools,
	useSchoolAccessUsers,
	useSchoolMutations,
	useSchools,
} from '@etnos/tools';
import type { SchoolInterface } from '@etnos/types';
import { DeleteOutlined, PlusOutlined, CopyOutlined } from '@ant-design/icons';
import { Title } from '@etnos/ui';
import {
	SchoolAccessPanel,
	SchoolGames,
	SchoolRanking,
	SchoolUsers,
	SchoolViewerEscolasSection,
} from '@etnos/components';

export default function EscolasPage() {
	const [open, setOpen] = useState(false);
	const [selectedSchoolId, setSelectedSchoolId] = useState<string>();
	const [schoolAccessEmail, setSchoolAccessEmail] = useState('');
	const [form] = Form.useForm();

	const { user } = useAuth();
	const {
		createSchool,
		deleteSchool,
		updateSchoolField,
		addSchoolAccessUser,
		removeSchoolAccessUser,
	} = useSchoolMutations();

	const isAdmin = user?.role?.includes('admin');
	const isTeacherProfile = user?.role?.includes('teacher') && !isAdmin;
	const isSchoolProfile = user?.role?.includes('school') && !isAdmin;
	const isSchoolViewerProfile = isSchoolProfile || isTeacherProfile;

	const { data: schools = [], isLoading: isLoadingSchools } = useSchools({
		enabled: isAdmin,
	});

	const effectiveSelectedSchoolId =
		selectedSchoolId && schools.some((school) => school.id === selectedSchoolId)
			? selectedSchoolId
			: schools[0]?.id;

	const { data: managedSchools = [], isLoading: isLoadingManagedSchools } =
		useManagedSchools({ enabled: isSchoolViewerProfile });

	const effectiveManagedSchoolId =
		selectedSchoolId &&
		managedSchools.some((school) => school.id === selectedSchoolId)
			? selectedSchoolId
			: managedSchools[0]?.id;

	const selectedManagedSchool =
		managedSchools.find((school) => school.id === effectiveManagedSchoolId) ??
		null;

	const { data: schoolAccessUsers = [], isLoading: isLoadingSchoolAccessUsers } =
		useSchoolAccessUsers(effectiveSelectedSchoolId ?? '', {
			enabled: isAdmin && Boolean(effectiveSelectedSchoolId),
		});

	const isLoading =
		isLoadingSchools ||
		isLoadingManagedSchools ||
		isLoadingSchoolAccessUsers ||
		createSchool.isPending ||
		deleteSchool.isPending ||
		updateSchoolField.isPending ||
		addSchoolAccessUser.isPending ||
		removeSchoolAccessUser.isPending;

	const handleCreateFinish = (values: SchoolInterface) => {
		if (createSchool.isPending) return;
		createSchool.mutate(values, {
			onSuccess: () => {
				form.resetFields();
				setOpen(false);
				message.success('Escola criada com sucesso');
			},
			onError: () => message.error('Erro ao criar escola'),
		});
	};

	const handleAddSchoolAccess = () => {
		if (!effectiveSelectedSchoolId || !schoolAccessEmail.trim()) {
			message.error('Selecione uma escola e informe um e-mail válido.');
			return;
		}
		addSchoolAccessUser.mutate(
			{
				schoolId: effectiveSelectedSchoolId,
				email: schoolAccessEmail.trim(),
			},
			{
				onSuccess: () => {
					setSchoolAccessEmail('');
					message.success('Usuário vinculado à escola com sucesso');
				},
				onError: () => message.error('Erro ao vincular usuário à escola'),
			},
		);
	};

	const handleRemoveSchoolAccess = (userId?: string) => {
		if (!effectiveSelectedSchoolId || !userId) {
			message.error('Não foi possível identificar o vínculo para remoção.');
			return;
		}
		removeSchoolAccessUser.mutate(
			{ schoolId: effectiveSelectedSchoolId, userId },
			{
				onSuccess: () => message.success('Acesso removido com sucesso'),
				onError: () => message.error('Erro ao remover acesso da escola'),
			},
		);
	};

	const handleCopySchoolCode = (schoolCode: string) => {
		navigator.clipboard.writeText(
			`${globalThis.window.location.origin}/cadastro/escola/${schoolCode}`,
		);
		message.success('Código da escola copiado para a área de transferência');
	};

	const schoolViewerTabItems = [
		{
			key: 'game-access',
			label: 'Jogos e personagens habilitados',
			children: effectiveManagedSchoolId ? (
				<SchoolGames
					schoolId={effectiveManagedSchoolId}
					schoolName={selectedManagedSchool?.name}
				/>
			) : null,
		},
		{
			key: 'school-users',
			label: 'Usuarios da escola',
			children: effectiveManagedSchoolId ? (
				<SchoolUsers schoolId={effectiveManagedSchoolId} />
			) : null,
		},
		{
			key: 'user-ranking',
			label: 'Ranking por usuário',
			children: effectiveManagedSchoolId ? (
				<SchoolRanking schoolId={effectiveManagedSchoolId} />
			) : null,
		},
	];

	const adminTabItems = [
		{
			key: 'game-access',
			label: 'Jogos e personagens habilitados',
			children: effectiveSelectedSchoolId ? (
				<SchoolGames
					schoolId={effectiveSelectedSchoolId}
					schoolName={
						schools.find((school) => school.id === effectiveSelectedSchoolId)
							?.name
					}
				/>
			) : null,
		},
		{
			key: 'school-users',
			label: 'Usuarios da escola',
			children: effectiveSelectedSchoolId ? (
				<div className="flex flex-col gap-10">
					<SchoolAccessPanel
						schoolAccessEmail={schoolAccessEmail}
						onSchoolAccessEmailChange={setSchoolAccessEmail}
						onAddAccess={handleAddSchoolAccess}
						isAdding={addSchoolAccessUser.isPending}
						isRemoving={removeSchoolAccessUser.isPending}
						removingUserId={removeSchoolAccessUser.variables?.userId}
						users={schoolAccessUsers}
						onRemoveAccess={handleRemoveSchoolAccess}
						disabled={!effectiveSelectedSchoolId}
					/>
					<SchoolUsers schoolId={effectiveSelectedSchoolId} />
				</div>
			) : null,
		},
		{
			key: 'user-ranking',
			label: 'Ranking por usuário',
			children: effectiveSelectedSchoolId ? (
				<SchoolRanking schoolId={effectiveSelectedSchoolId} />
			) : null,
		},
	];

	if (isSchoolViewerProfile) {
		return (
			<SchoolViewerEscolasSection
				isLoading={isLoading}
				effectiveManagedSchoolId={effectiveManagedSchoolId}
				selectedManagedSchool={selectedManagedSchool}
				managedSchools={managedSchools}
				schoolViewerTabItems={schoolViewerTabItems}
				setSelectedSchoolId={setSelectedSchoolId}
			/>
		);
	}

	return (
		<Spin spinning={isLoading}>
			<div className="container mx-auto py-4 px-6 md:py-10 md:px-0">
				<Breadcrumb
					items={[
						{ title: 'Home', href: '/' },
						{ title: 'Área do administrador', href: '/admin' },
						{ title: 'Escolas' },
					]}
				/>

				<Title className="mb-4 mt-6">Escolas</Title>

				<Table
					columns={[
						{
							title: 'Nome',
							key: 'name',
							render: (_, record) => (
								<Typography.Text
									editable={{
										onChange(value) {
											updateSchoolField.mutate(
												{ id: record.id, field: 'name', value },
												{
													onSuccess: () =>
														message.success('Campo atualizado com sucesso'),
													onError: () =>
														message.error('Erro ao atualizar campo'),
												},
											);
										},
									}}
								>
									{record.name}
								</Typography.Text>
							),
						},
						{
							title: 'Código',
							dataIndex: 'id',
							key: 'id',
							render: (id: string) => (
								<div className="flex flex-col gap-2">
									<button
										type="button"
										onClick={() => handleCopySchoolCode(id)}
										className="flex items-center gap-2 text-slate-600 text-xs py-1 rounded border border-slate-200 w-36 justify-center"
									>
										<CopyOutlined />
										Link para cadastro
									</button>
									<div className="text-sm text-slate-800 font-medium">{id}</div>
								</div>
							),
						},
						{
							title: 'Cidade',
							dataIndex: 'city',
							key: 'city',
						},
						{
							title: 'Estado',
							dataIndex: 'state',
							key: 'state',
						},
						{
							title: 'Ações',
							key: 'action',
							width: 40,
							dataIndex: 'id',
							render: (id: string) => (
								<Button
									danger
									icon={<DeleteOutlined />}
									onClick={() =>
										deleteSchool.mutate(id, {
											onSuccess: () =>
												message.success('Escola excluida com sucesso'),
											onError: () => message.error('Erro ao excluir escola'),
										})
									}
								/>
							),
						},
					]}
					dataSource={schools}
					pagination={false}
					rowKey="id"
				/>

				<div className="mt-8">
					<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
						<div>
							<Title className="mb-1">Gestão da escola selecionada</Title>
							<p className="text-slate-600 text-sm">
								Selecione uma escola para configurar jogos e personagens
								habilitados, gerir usuários e acompanhar o ranking.
							</p>
						</div>

						<Select
							placeholder="Selecione uma escola"
							value={effectiveSelectedSchoolId}
							onChange={setSelectedSchoolId}
							options={schools.map((school) => ({
								value: school.id,
								label: school.name,
							}))}
							className="w-full md:max-w-sm"
						/>
					</div>

					<Tabs defaultActiveKey="game-access" items={adminTabItems} />
				</div>

				<FloatButton
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => setOpen((current) => !current)}
				/>

				<Drawer
					open={open}
					title="Adicionar Escola"
					onClose={() => setOpen(false)}
					destroyOnHidden
				>
					<Form layout="vertical" form={form} onFinish={handleCreateFinish}>
						<Form.Item name="name" label="Nome">
							<Input />
						</Form.Item>

						<Form.Item
							name="code"
							label="Código identificador"
							rules={[
								{
									required: true,
									message: 'Informe o código identificador da escola.',
								},
							]}
						>
							<Input placeholder="Ex.: ESCOLA-AURORA" />
						</Form.Item>

						<Form.Item name="city" label="Cidade">
							<Input />
						</Form.Item>

						<Form.Item name="state" label="Estado">
							<Input />
						</Form.Item>

						<Button
							type="primary"
							htmlType="submit"
							block
							loading={createSchool.isPending}
							disabled={createSchool.isPending}
						>
							Salvar
						</Button>
					</Form>
				</Drawer>
			</div>
		</Spin>
	);
}
