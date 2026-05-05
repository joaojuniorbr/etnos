'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Breadcrumb,
	Button,
	Drawer,
	FloatButton,
	Form,
	Input,
	Select,
	Spin,
	Tag,
	Table,
	Tabs,
	Typography,
	message,
} from 'antd';
import { schoolService, useAuth } from '@etnos/tools';
import { type SchoolInterface, type SchoolUserInterface } from '@etnos/types';

import { DeleteOutlined, PlusOutlined, CopyOutlined } from '@ant-design/icons';
import { Title } from '@etnos/ui';
import {
	SchoolData,
	SchoolGames,
	SchoolRanking,
	SchoolUsers,
} from '@etnos/components';

export default function EscolasPage() {
	const [open, setOpen] = useState(false);
	const [selectedSchoolId, setSelectedSchoolId] = useState<string>();
	const [schoolAccessEmail, setSchoolAccessEmail] = useState('');
	const [form] = Form.useForm();

	const { user } = useAuth();
	const queryClient = useQueryClient();

	const isAdmin = user?.role?.includes('admin');
	const isTeacherProfile = user?.role?.includes('teacher') && !isAdmin;
	const isSchoolProfile = user?.role?.includes('school') && !isAdmin;
	const isSchoolViewerProfile = isSchoolProfile || isTeacherProfile;

	const toggleDrawer = () => setOpen(!open);

	const { data: schools = [], isLoading: isLoadingSchools } = useQuery({
		queryKey: ['schools', 'admin'],
		queryFn: () => schoolService.getAll(),
		enabled: isAdmin,
	});

	const effectiveSelectedSchoolId =
		selectedSchoolId && schools.some((school) => school.id === selectedSchoolId)
			? selectedSchoolId
			: schools[0]?.id;

	const { data: managedSchools = [], isLoading: isLoadingManagedSchools } =
		useQuery({
			queryKey: ['schools', 'me', 'managed'],
			queryFn: () => schoolService.getManagedSchools(),
			enabled: isSchoolViewerProfile,
		});

	const effectiveManagedSchoolId =
		selectedSchoolId &&
		managedSchools.some((school) => school.id === selectedSchoolId)
			? selectedSchoolId
			: managedSchools[0]?.id;

	const selectedManagedSchool =
		managedSchools.find((school) => school.id === effectiveManagedSchoolId) ??
		null;

	const {
		data: schoolAccessUsers = [],
		isLoading: isLoadingSchoolAccessUsers,
	} = useQuery<SchoolUserInterface[]>({
		queryKey: ['schools', 'admin', 'access-users', effectiveSelectedSchoolId],
		queryFn: () =>
			schoolService.getAccessUsersBySchool(effectiveSelectedSchoolId as string),
		enabled: isAdmin && !!effectiveSelectedSchoolId,
	});

	const createSchoolMutation = useMutation({
		mutationFn: (values: SchoolInterface) => schoolService.create(values),
		onSuccess: () => {
			form.resetFields();
			setOpen(false);
			void queryClient.invalidateQueries({ queryKey: ['schools', 'admin'] });
			message.success('Escola criada com sucesso');
		},
		onError: () => {
			message.error('Erro ao criar escola');
		},
	});

	const deleteSchoolMutation = useMutation({
		mutationFn: (id: string) => schoolService.delete(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['schools', 'admin'] });
			message.success('Escola excluida com sucesso');
		},
		onError: () => {
			message.error('Erro ao excluir escola');
		},
	});

	const updateSchoolMutation = useMutation({
		mutationFn: ({
			id,
			field,
			value,
		}: {
			id: string;
			field: string;
			value: string;
		}) => schoolService.update(id, { [field]: value }),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['schools', 'admin'] });
			message.success('Campo atualizado com sucesso');
		},
		onError: () => {
			message.error('Erro ao atualizar campo');
		},
	});

	const addSchoolAccessMutation = useMutation({
		mutationFn: ({ schoolId, email }: { schoolId: string; email: string }) =>
			schoolService.addAccessUserToSchool(schoolId, email),
		onSuccess: () => {
			setSchoolAccessEmail('');
			void queryClient.invalidateQueries({
				queryKey: ['schools', 'admin', 'access-users'],
			});
			message.success('Usuário vinculado à escola com sucesso');
		},
		onError: () => {
			message.error('Erro ao vincular usuário à escola');
		},
	});

	const removeSchoolAccessMutation = useMutation({
		mutationFn: ({ schoolId, userId }: { schoolId: string; userId: string }) =>
			schoolService.removeAccessUserFromSchool(schoolId, userId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['schools', 'admin', 'access-users'],
			});
			message.success('Acesso removido com sucesso');
		},
		onError: () => {
			message.error('Erro ao remover acesso da escola');
		},
	});

	const isLoading =
		isLoadingSchools ||
		isLoadingManagedSchools ||
		isLoadingSchoolAccessUsers ||
		createSchoolMutation.isPending ||
		deleteSchoolMutation.isPending ||
		updateSchoolMutation.isPending ||
		addSchoolAccessMutation.isPending ||
		removeSchoolAccessMutation.isPending;

	const handleCreateFinish = (values: SchoolInterface) => {
		if (createSchoolMutation.isPending) return;
		createSchoolMutation.mutate(values);
	};

	const handleAddSchoolAccess = () => {
		if (!effectiveSelectedSchoolId || !schoolAccessEmail.trim()) {
			message.error('Selecione uma escola e informe um e-mail válido.');
			return;
		}
		addSchoolAccessMutation.mutate({
			schoolId: effectiveSelectedSchoolId,
			email: schoolAccessEmail.trim(),
		});
	};

	const handleRemoveSchoolAccess = (userId?: string) => {
		if (!effectiveSelectedSchoolId || !userId) {
			message.error('Não foi possível identificar o vínculo para remoção.');
			return;
		}
		removeSchoolAccessMutation.mutate({
			schoolId: effectiveSelectedSchoolId,
			userId,
		});
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
					<div>
						<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
							<div>
								<Title className="mb-1">Acessos ao painel da escola</Title>
								<p className="text-slate-600 text-sm">
									Defina quais perfis com role <code>school</code> podem
									visualizar a escola selecionada. Se o e-mail ainda não existir,
									o usuário será cadastrado automaticamente.
								</p>
							</div>

							<div className="flex w-full flex-col gap-2 md:max-w-xl md:flex-row">
								<Input
									placeholder="email@escola.com"
									value={schoolAccessEmail}
									onChange={(event) =>
										setSchoolAccessEmail(event.target.value)
									}
								/>
								<Button
									type="primary"
									onClick={handleAddSchoolAccess}
									loading={addSchoolAccessMutation.isPending}
									disabled={!effectiveSelectedSchoolId}
								>
									Adicionar e-mail
								</Button>
							</div>
						</div>

						<Table
							rowKey="uid"
							pagination={{ pageSize: 8 }}
							dataSource={schoolAccessUsers}
							columns={[
								{
									title: 'Usuário',
									render: (_, record: SchoolUserInterface) =>
										record.childName ||
										record.parentName ||
										record.email ||
										'-',
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
											onClick={() => handleRemoveSchoolAccess(record.id)}
											loading={
												removeSchoolAccessMutation.isPending &&
												removeSchoolAccessMutation.variables?.userId ===
													record.id
											}
										>
											Remover
										</Button>
									),
								},
							]}
							locale={{
								emptyText:
									'Nenhum perfil school foi vinculado à escola selecionada.',
							}}
						/>
					</div>

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
		if (!effectiveManagedSchoolId || !selectedManagedSchool) {
			return (
				<Spin spinning={isLoading}>
					<div className="container mx-auto py-4 px-6 md:py-10">
						<Breadcrumb
							items={[
								{ title: 'Home', href: '/' },
								{ title: 'Área da escola', href: '/admin' },
								{ title: 'Minhas escolas' },
							]}
						/>

						<Title className="mb-4 mt-6">Minhas Escolas</Title>
						<div className="rounded border border-slate-200 bg-white p-4">
							<p className="text-slate-600">
								Seu perfil ainda não possui escola vinculada para visualização.
								Peça para um administrador liberar o acesso.
							</p>
						</div>
					</div>
				</Spin>
			);
		}

		return (
			<Spin spinning={isLoading}>
				<div className="container mx-auto py-4 px-6 md:py-10">
					<Breadcrumb
						items={[
							{ title: 'Home', href: '/' },
							{ title: 'Área da escola', href: '/admin' },
							{ title: 'Minha escola' },
						]}
					/>

					<Title className="mb-4 mt-6">Minhas Escolas</Title>

					<div className="grid gap-6">
						<div className="max-w-md">
							<Select
								placeholder="Selecione uma escola"
								value={effectiveManagedSchoolId}
								onChange={setSelectedSchoolId}
								options={managedSchools.map((school) => ({
									value: school.id,
									label: school.name,
								}))}
								className="w-full"
							/>
						</div>
						<SchoolData school={selectedManagedSchool} />
						<Tabs defaultActiveKey="game-access" items={schoolViewerTabItems} />
					</div>
				</div>
			</Spin>
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
											updateSchoolMutation.mutate({
												id: record.id,
												field: 'name',
												value,
											});
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
									onClick={() => deleteSchoolMutation.mutate(id)}
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
					onClick={toggleDrawer}
				/>

				<Drawer
					open={open}
					title="Adicionar Escola"
					onClose={toggleDrawer}
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
							loading={createSchoolMutation.isPending}
							disabled={createSchoolMutation.isPending}
						>
							Salvar
						</Button>
					</Form>
				</Drawer>
			</div>
		</Spin>
	);
}
