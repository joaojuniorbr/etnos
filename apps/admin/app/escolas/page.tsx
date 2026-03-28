'use client';

import { useDeferredValue, useState } from 'react';
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
	Table,
	Typography,
	message,
} from 'antd';
import { schoolService, useAuth } from '@etnos/tools';
import {
	GameNameEnum,
	GamesEnum,
	type SchoolInterface,
	type SchoolUserInterface,
	type UserRankingInterface,
} from '@etnos/types';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Title } from '@etnos/ui';
import { SchoolData, SchoolUsers, UserRanking } from '@etnos/components';

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

export default function EscolasPage() {
	const [open, setOpen] = useState(false);
	const [selectedSchoolId, setSelectedSchoolId] = useState<string>();
	const [userSearch, setUserSearch] = useState('');
	const [selectedGame, setSelectedGame] = useState<string>('all');
	const [sendingRecoveryEmail, setSendingRecoveryEmail] = useState<
		string | null
	>(null);
	const [form] = Form.useForm();

	const { user, onRecoveryPass } = useAuth();
	const queryClient = useQueryClient();
	const deferredUserSearch = useDeferredValue(userSearch.trim());

	const isAdmin = user?.role?.includes('admin');
	const isSchoolProfile = user?.role?.includes('school') && !isAdmin;
	const selectedGameSlug = selectedGame === 'all' ? undefined : selectedGame;

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
		enabled: isSchoolProfile,
	});

	const { data: schoolUsers = [], isLoading: isLoadingSchoolUsers } = useQuery<
		SchoolUserInterface[]
	>({
		queryKey: ['schools', 'me', 'users', deferredUserSearch],
		queryFn: () => schoolService.getMyUsers(deferredUserSearch || undefined),
		enabled: isSchoolProfile,
	});

	const {
		data: schoolUserRanking = [],
		isLoading: isLoadingSchoolUserRanking,
	} = useQuery<UserRankingInterface[]>({
		queryKey: ['schools', 'me', 'users-ranking', selectedGameSlug ?? 'all'],
		queryFn: () => schoolService.getMyUsersRanking(selectedGameSlug),
		enabled: isSchoolProfile,
	});

	const { data: adminUserRanking = [], isLoading: isLoadingAdminUserRanking } =
		useQuery<UserRankingInterface[]>({
			queryKey: [
				'schools',
				'admin',
				'users-ranking',
				effectiveSelectedSchoolId,
				selectedGameSlug ?? 'all',
			],
			queryFn: () =>
				schoolService.getUsersRankingBySchool(
					effectiveSelectedSchoolId as string,
					selectedGameSlug
				),
			enabled: isAdmin && !!effectiveSelectedSchoolId,
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

	const isLoading =
		isLoadingSchools ||
		isLoadingMySchool ||
		isLoadingSchoolUsers ||
		isLoadingSchoolUserRanking ||
		isLoadingAdminUserRanking ||
		createSchoolMutation.isPending ||
		deleteSchoolMutation.isPending ||
		updateSchoolMutation.isPending;

	const handleCreateFinish = (values: SchoolInterface) => {
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

	if (isSchoolProfile) {
		return (
			<Spin spinning={isLoading}>
				<div className='container mx-auto py-4 px-6 md:py-10 md:px-0'>
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

					<Title className='mb-4 mt-6'>Minha Escola</Title>
					<p className='text-slate-600 mb-6'>
						Consulte os dados da sua escola, veja os usuários vinculados e
						acompanhe o ranking por jogo.
					</p>

					<div className='grid gap-6'>
						<SchoolData school={mySchool} />
						<SchoolUsers
							users={schoolUsers}
							search={userSearch}
							onSearchChange={setUserSearch}
							onSendPassword={handleSendPassword}
							sendingRecoveryEmail={sendingRecoveryEmail}
						/>
						<UserRanking
							ranking={schoolUserRanking}
							selectedGame={selectedGame}
							onGameChange={setSelectedGame}
							gameOptions={gameOptions}
						/>
					</div>
				</div>
			</Spin>
		);
	}

	return (
		<Spin spinning={isLoading}>
			<div className='container mx-auto py-4 px-6 md:py-10 md:px-0'>
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

				<Title className='mb-4 mt-6'>Escolas</Title>

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
					rowKey='id'
				/>

				<div className='mt-8'>
					<div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4'>
						<div>
							<Title className='mb-1'>Ranking de usuários por escola</Title>
							<p className='text-slate-600 text-sm'>
								Selecione uma escola para acompanhar a pontuação dos usuários
								vinculados a ela.
							</p>
						</div>

						<Select
							placeholder='Selecione uma escola'
							value={effectiveSelectedSchoolId}
							onChange={setSelectedSchoolId}
							options={schools.map((school) => ({
								value: school.id,
								label: school.name,
							}))}
							className='w-full md:max-w-sm'
						/>
					</div>

					<UserRanking
						ranking={adminUserRanking}
						selectedGame={selectedGame}
						onGameChange={setSelectedGame}
						gameOptions={gameOptions}
					/>
				</div>

				<FloatButton
					type='primary'
					icon={<PlusOutlined />}
					onClick={toggleDrawer}
				/>

				<Drawer
					open={open}
					title='Adicionar Escola'
					onClose={toggleDrawer}
					destroyOnHidden
				>
					<Form layout='vertical' form={form} onFinish={handleCreateFinish}>
						<Form.Item name='name' label='Nome'>
							<Input />
						</Form.Item>

						<Form.Item name='city' label='Cidade'>
							<Input />
						</Form.Item>

						<Form.Item name='state' label='Estado'>
							<Input />
						</Form.Item>

						<Button type='primary' htmlType='submit' block>
							Salvar
						</Button>
					</Form>
				</Drawer>
			</div>
		</Spin>
	);
}
