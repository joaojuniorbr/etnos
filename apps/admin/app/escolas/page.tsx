'use client';

import { useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Breadcrumb,
	Button,
	Card,
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
import {
	schoolService,
	usersService,
	useAuth,
	useCharacter,
} from '@etnos/tools';
import {
	GameNameEnum,
	GamesEnum,
	type SchoolGameAccessInterface,
	type SchoolInterface,
	type SchoolUserInterface,
	type UpdateSchoolGameAccessPayload,
	type UserRole,
	type UserRankingInterface,
} from '@etnos/types';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Title } from '@etnos/ui';
import {
	SchoolData,
	SchoolGameAccess,
	SchoolUsers,
	UserRanking,
} from '@etnos/components';

const gameOptions = [
	{
		value: 'all',
		label: 'Todos os jogos',
	},
	...Object.values(GamesEnum).map((gameSlug) => ({
		value: gameSlug,
		label: GameNameEnum[gameSlug],
	})),
];

const manageableGameOptions = Object.values(GamesEnum).map((gameSlug) => ({
	value: gameSlug,
	label: GameNameEnum[gameSlug],
}));

export default function EscolasPage() {
	const [open, setOpen] = useState(false);
	const [selectedSchoolId, setSelectedSchoolId] = useState<string>();
	const [userSearch, setUserSearch] = useState('');
	const [selectedGame, setSelectedGame] = useState<string>('all');
	const [selectedCharacter, setSelectedCharacter] = useState<string>('all');
	const [schoolAccessEmail, setSchoolAccessEmail] = useState('');
	const [sendingRecoveryEmail, setSendingRecoveryEmail] = useState<
		string | null
	>(null);
	const [form] = Form.useForm();

	const { user, onRecoveryPass } = useAuth();
	const queryClient = useQueryClient();
	const deferredUserSearch = useDeferredValue(userSearch.trim());

	const isAdmin = user?.role?.includes('admin');
	const isTeacherProfile = user?.role?.includes('teacher') && !isAdmin;
	const isSchoolProfile = user?.role?.includes('school') && !isAdmin;
	const isSchoolViewerProfile = isSchoolProfile || isTeacherProfile;
	const selectedGameSlug = selectedGame === 'all' ? undefined : selectedGame;
	const selectedCharacterSlug =
		selectedCharacter === 'all' ? undefined : selectedCharacter;
	const { data: characters = [] } = useCharacter({
		fetchList: Boolean(isAdmin || isSchoolViewerProfile),
	});
	const characterOptions = [
		{
			value: 'all',
			label: 'Todos os personagens',
		},
		...characters.map((character) => ({
			value: character.slug,
			label: character.name,
		})),
	];
	const manageableCharacterOptions = characters.map((character) => ({
		value: character.slug,
		label: character.name,
	}));

	const toggleDrawer = () => {
		setOpen(!open);
	};

	const { data: schools = [], isLoading: isLoadingSchools } = useQuery({
		queryKey: ['schools', 'admin'],
		queryFn: () => schoolService.getAll(),
		enabled: isAdmin,
	});

	const effectiveSelectedSchoolId =
		selectedSchoolId && schools.some((school) => school.id === selectedSchoolId)
			? selectedSchoolId
			: schools[0]?.id;

	const { data: mySchool = null, isLoading: isLoadingMySchool } = useQuery({
		queryKey: ['schools', 'me'],
		queryFn: () => schoolService.getMySchool(),
		enabled: false,
	});

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

	const { data: schoolUsers = [], isLoading: isLoadingSchoolUsers } = useQuery<
		SchoolUserInterface[]
	>({
		queryKey: [
			'schools',
			'viewer',
			'users',
			effectiveManagedSchoolId,
			deferredUserSearch,
		],
		queryFn: () =>
			schoolService.getUsersBySchool(
				effectiveManagedSchoolId as string,
				deferredUserSearch || undefined,
			),
		enabled: isSchoolProfile && !!effectiveManagedSchoolId,
	});

	const {
		data: schoolUserRanking = [],
		isLoading: isLoadingSchoolUserRanking,
	} = useQuery<UserRankingInterface[]>({
		queryKey: [
			'schools',
			'viewer',
			'users-ranking',
			effectiveManagedSchoolId,
			selectedGameSlug ?? 'all',
			selectedCharacterSlug ?? 'all',
		],
		queryFn: () =>
			schoolService.getUsersRankingBySchool(
				effectiveManagedSchoolId as string,
				selectedGameSlug,
				selectedCharacterSlug,
			),
		enabled: isSchoolViewerProfile && !!effectiveManagedSchoolId,
	});

	const { data: adminUserRanking = [], isLoading: isLoadingAdminUserRanking } =
		useQuery<UserRankingInterface[]>({
			queryKey: [
				'schools',
				'admin',
				'users-ranking',
				effectiveSelectedSchoolId,
				selectedGameSlug ?? 'all',
				selectedCharacterSlug ?? 'all',
			],
			queryFn: () =>
				schoolService.getUsersRankingBySchool(
					effectiveSelectedSchoolId as string,
					selectedGameSlug,
					selectedCharacterSlug,
				),
			enabled: isAdmin && !!effectiveSelectedSchoolId,
		});

	const {
		data: schoolAccessUsers = [],
		isLoading: isLoadingSchoolAccessUsers,
	} = useQuery<SchoolUserInterface[]>({
		queryKey: ['schools', 'admin', 'access-users', effectiveSelectedSchoolId],
		queryFn: () =>
			schoolService.getAccessUsersBySchool(effectiveSelectedSchoolId as string),
		enabled: isAdmin && !!effectiveSelectedSchoolId,
	});

	const schoolGameAccessTargetId = isSchoolViewerProfile
		? effectiveManagedSchoolId
		: effectiveSelectedSchoolId;

	const { data: schoolGameAccess, isLoading: isLoadingSchoolGameAccess } =
		useQuery<SchoolGameAccessInterface>({
			queryKey: ['schools', 'game-access', schoolGameAccessTargetId],
			queryFn: () =>
				schoolService.getGameAccessBySchool(schoolGameAccessTargetId as string),
			enabled:
				Boolean(schoolGameAccessTargetId) &&
				Boolean(isAdmin || isSchoolViewerProfile),
		});

	const createSchoolMutation = useMutation({
		mutationFn: (values: SchoolInterface) => schoolService.create(values),
		onSuccess: () => {
			form.resetFields();
			setOpen(false);
			void queryClient.invalidateQueries({
				queryKey: ['schools', 'admin'],
			});
			message.success('Escola criada com sucesso');
		},
		onError: () => {
			message.error('Erro ao criar escola');
		},
	});

	const deleteSchoolMutation = useMutation({
		mutationFn: (id: string) => schoolService.delete(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['schools', 'admin'],
			});
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
		}) =>
			schoolService.update(id, {
				[field]: value,
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['schools', 'admin'],
			});
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

	const updateSchoolUserRolesMutation = useMutation({
		mutationFn: ({ userId, roles }: { userId: string; roles: UserRole[] }) =>
			usersService.update(userId, { roles }),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['schools', 'viewer', 'users'],
			});
			void queryClient.invalidateQueries({
				queryKey: ['users', 'admin'],
			});
			message.success('Perfil do usuário atualizado com sucesso');
		},
		onError: () => {
			message.error('Erro ao atualizar perfil do usuário');
		},
	});

	const updateSchoolGameAccessMutation = useMutation({
		mutationFn: ({
			schoolId,
			payload,
		}: {
			schoolId: string;
			payload: UpdateSchoolGameAccessPayload;
		}) => schoolService.updateGameAccessBySchool(schoolId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['schools', 'game-access'],
			});
			message.success('Configuração da escola atualizada com sucesso');
		},
		onError: () => {
			message.error('Erro ao atualizar configuração da escola');
		},
	});

	const isLoading =
		isLoadingSchools ||
		isLoadingMySchool ||
		isLoadingManagedSchools ||
		isLoadingSchoolUsers ||
		isLoadingSchoolUserRanking ||
		isLoadingAdminUserRanking ||
		isLoadingSchoolAccessUsers ||
		isLoadingSchoolGameAccess ||
		createSchoolMutation.isPending ||
		deleteSchoolMutation.isPending ||
		updateSchoolMutation.isPending ||
		addSchoolAccessMutation.isPending ||
		removeSchoolAccessMutation.isPending ||
		updateSchoolUserRolesMutation.isPending ||
		updateSchoolGameAccessMutation.isPending;

	const handleCreateFinish = (values: SchoolInterface) => {
		if (createSchoolMutation.isPending) {
			return;
		}

		createSchoolMutation.mutate(values);
	};

	const handleDelete = (id: string) => {
		deleteSchoolMutation.mutate(id);
	};

	const handleUpdateField = (id: string, field: string, value: string) => {
		updateSchoolMutation.mutate({ id, field, value });
	};

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

	const handleUpdateSchoolUserRoles = (userId: string, roles: UserRole[]) => {
		if (updateSchoolUserRolesMutation.isPending) {
			return;
		}

		updateSchoolUserRolesMutation.mutate({ userId, roles });
	};

	const handleUpdateSchoolGameAccess = (
		schoolId: string,
		payload: UpdateSchoolGameAccessPayload,
	) => {
		if (updateSchoolGameAccessMutation.isPending) {
			return;
		}

		updateSchoolGameAccessMutation.mutate({ schoolId, payload });
	};

	const handleResetSchoolGameAccess = (schoolId: string) => {
		handleUpdateSchoolGameAccess(schoolId, {
			enabledGameSlugs: [],
			enabledCharacterSlugs: [],
		});
	};

	const schoolViewerTabItems = [
		{
			key: 'game-access',
			label: 'Jogos e personagens habilitados',
			children: schoolGameAccess ? (
				<SchoolGameAccess
					schoolName={selectedManagedSchool?.name ?? mySchool?.name}
					gameOptions={manageableGameOptions}
					characterOptions={manageableCharacterOptions}
					enabledGameSlugs={schoolGameAccess.enabledGameSlugs}
					enabledCharacterSlugs={schoolGameAccess.enabledCharacterSlugs}
					hasCustomGames={schoolGameAccess.hasCustomGames}
					hasCustomCharacters={schoolGameAccess.hasCustomCharacters}
					canEdit={Boolean(schoolGameAccess.canEdit && isSchoolProfile)}
					isSaving={updateSchoolGameAccessMutation.isPending}
					onSave={(payload) =>
						handleUpdateSchoolGameAccess(
							effectiveManagedSchoolId as string,
							payload,
						)
					}
					onResetToDefault={() =>
						handleResetSchoolGameAccess(effectiveManagedSchoolId as string)
					}
				/>
			) : null,
		},
		{
			key: 'school-users',
			label: 'Usuarios da escola',
			children: isSchoolProfile ? (
				<SchoolUsers
					users={schoolUsers}
					search={userSearch}
					onSearchChange={setUserSearch}
					onSendPassword={handleSendPassword}
					sendingRecoveryEmail={sendingRecoveryEmail}
					currentUserUid={user?.uid}
					onRolesChange={handleUpdateSchoolUserRoles}
					updatingRolesUserId={
						updateSchoolUserRolesMutation.variables?.userId ?? null
					}
				/>
			) : (
				<Card>
					<p className="text-slate-600">
						Seu perfil pode acompanhar o ranking, mas nao possui permissao para
						gerenciar usuarios desta escola.
					</p>
				</Card>
			),
		},
		{
			key: 'user-ranking',
			label: 'Ranking por usuário',
			children: (
				<UserRanking
					ranking={schoolUserRanking}
					selectedGame={selectedGame}
					onGameChange={setSelectedGame}
					gameOptions={gameOptions}
					selectedCharacter={selectedCharacter}
					onCharacterChange={setSelectedCharacter}
					characterOptions={characterOptions}
				/>
			),
		},
	];

	const adminTabItems = [
		{
			key: 'game-access',
			label: 'Jogos e personagens habilitados',
			children: schoolGameAccess ? (
				<SchoolGameAccess
					schoolName={
						schools.find((school) => school.id === effectiveSelectedSchoolId)
							?.name
					}
					gameOptions={manageableGameOptions}
					characterOptions={manageableCharacterOptions}
					enabledGameSlugs={schoolGameAccess.enabledGameSlugs}
					enabledCharacterSlugs={schoolGameAccess.enabledCharacterSlugs}
					hasCustomGames={schoolGameAccess.hasCustomGames}
					hasCustomCharacters={schoolGameAccess.hasCustomCharacters}
					canEdit={schoolGameAccess.canEdit}
					isSaving={updateSchoolGameAccessMutation.isPending}
					onSave={(payload) =>
						handleUpdateSchoolGameAccess(
							effectiveSelectedSchoolId as string,
							payload,
						)
					}
					onResetToDefault={() =>
						handleResetSchoolGameAccess(effectiveSelectedSchoolId as string)
					}
				/>
			) : null,
		},
		{
			key: 'school-users',
			label: 'Usuarios da escola',
			children: (
				<div>
					<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div>
							<Title className="mb-1">Gestão de usuários da escola</Title>
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
								onChange={(event) => setSchoolAccessEmail(event.target.value)}
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
										onClick={() => handleRemoveSchoolAccess(record.id)}
										loading={
											removeSchoolAccessMutation.isPending &&
											removeSchoolAccessMutation.variables?.userId === record.id
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
			),
		},
		{
			key: 'user-ranking',
			label: 'Ranking por usuário',
			children: (
				<div>
					<div className="mb-4">
						<Title className="mb-1">Ranking de usuários por escola</Title>
						<p className="text-slate-600 text-sm">
							Acompanhe a pontuação dos usuários vinculados à escola
							selecionada.
						</p>
					</div>

					<UserRanking
						ranking={adminUserRanking}
						selectedGame={selectedGame}
						onGameChange={setSelectedGame}
						gameOptions={gameOptions}
						selectedCharacter={selectedCharacter}
						onCharacterChange={setSelectedCharacter}
						characterOptions={characterOptions}
					/>
				</div>
			),
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
								{
									title: 'Área da escola',
									href: '/admin',
								},
								{
									title: 'Minhas escolas',
								},
							]}
						/>

						<Title className="mb-4 mt-6">Minhas Escolas</Title>
						<Card>
							<p className="text-slate-600">
								Seu perfil ainda não possui escola vinculada para visualização.
								Peça para um administrador liberar o acesso.
							</p>
						</Card>
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
							{
								title: 'Área da escola',
								href: '/admin',
							},
							{
								title: 'Minha escola',
							},
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
						<SchoolData school={selectedManagedSchool ?? mySchool} />
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
						{
							title: 'Área do administrador',
							href: '/admin',
						},
						{
							title: 'Escolas',
						},
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
											handleUpdateField(record.id, 'name', value);
										},
									}}
								>
									{record.name}
								</Typography.Text>
							),
						},
						{
							title: 'Código',
							dataIndex: 'code',
							key: 'code',
							render: (value: string | null | undefined) => value || '-',
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
									onClick={() => handleDelete(id)}
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
