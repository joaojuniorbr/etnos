'use client';

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
import { useEffect, useState } from 'react';

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
	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState<SchoolInterface[]>([]);
	const [schoolUsers, setSchoolUsers] = useState<SchoolUserInterface[]>([]);
	const [userRanking, setUserRanking] = useState<UserRankingInterface[]>([]);
	const [mySchool, setMySchool] = useState<SchoolInterface | null>(null);
	const [selectedSchoolId, setSelectedSchoolId] = useState<string>();
	const [userSearch, setUserSearch] = useState('');
	const [selectedGame, setSelectedGame] = useState<string>('all');
	const [sendingRecoveryEmail, setSendingRecoveryEmail] = useState<
		string | null
	>(null);
	const [form] = Form.useForm();

	const { user, onRecoveryPass } = useAuth();

	const isAdmin = user?.role?.includes('admin');
	const isSchoolProfile = user?.role?.includes('school') && !isAdmin;

	const toggleDrawer = () => {
		setOpen(!open);
	};

	const loadAdminSchools = () => {
		setIsLoading(true);
		schoolService
			.getAll()
			.then((res) => {
				setData(res);
				setSelectedSchoolId((currentSelectedSchoolId) => {
					if (
						currentSelectedSchoolId &&
						res.some((school) => school.id === currentSelectedSchoolId)
					) {
						return currentSelectedSchoolId;
					}

					return res[0]?.id;
				});
			})
			.catch(() => {
				message.error('Erro ao carregar escolas');
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const loadSchoolArea = (gameSlug?: string) => {
		setIsLoading(true);
		Promise.all([
			schoolService.getMySchool(),
			schoolService.getMyUsers(userSearch.trim() || undefined),
			schoolService.getMyUsersRanking(gameSlug),
		])
			.then(([school, users, ranking]) => {
				setMySchool(school);
				setSchoolUsers(users);
				setUserRanking(ranking);
			})
			.catch(() => {
				message.error('Erro ao carregar painel da escola');
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const handleCreateFinish = (values: SchoolInterface) => {
		setIsLoading(true);
		schoolService
			.create(values)
			.then(() => {
				form.resetFields();
				toggleDrawer();
				loadAdminSchools();
				message.success('Escola criada com sucesso');
			})
			.catch(() => {
				message.error('Erro ao criar escola');
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const handleDelete = (id: string) => {
		setIsLoading(true);
		schoolService
			.delete(id)
			.then(() => {
				message.success('Escola excluida com sucesso');
				loadAdminSchools();
			})
			.finally(() => setIsLoading(false));
	};

	const handleUpdateField = (id: string, field: string, value: string) => {
		setIsLoading(true);
		schoolService
			.update(id, {
				[field]: value,
			})
			.then(() => {
				message.success('Campo atualizado com sucesso');
				loadAdminSchools();
			})
			.catch(() => {
				message.error('Erro ao atualizar campo');
			})
			.finally(() => setIsLoading(false));
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

	useEffect(() => {
		if (!isSchoolProfile) {
			loadAdminSchools();
		}
	}, [isSchoolProfile]);

	useEffect(() => {
		if (!isSchoolProfile) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			loadSchoolArea(selectedGame === 'all' ? undefined : selectedGame);
		}, 300);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [isSchoolProfile, selectedGame, userSearch]);

	useEffect(() => {
		if (isSchoolProfile || !selectedSchoolId) {
			return;
		}

		setIsLoading(true);
		schoolService
			.getUsersRankingBySchool(
				selectedSchoolId,
				selectedGame === 'all' ? undefined : selectedGame
			)
			.then((ranking) => {
				setUserRanking(ranking);
			})
			.catch(() => {
				message.error('Erro ao carregar ranking da escola selecionada');
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [isSchoolProfile, selectedGame, selectedSchoolId]);

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
							ranking={userRanking}
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
					dataSource={data}
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
							value={selectedSchoolId}
							onChange={setSelectedSchoolId}
							options={data.map((school) => ({
								value: school.id,
								label: school.name,
							}))}
							className='w-full md:max-w-sm'
						/>
					</div>

					<UserRanking
						ranking={userRanking}
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
