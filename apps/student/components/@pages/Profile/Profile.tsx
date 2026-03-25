'use client';

import {
	Button,
	DatePicker,
	Divider,
	Drawer,
	Form,
	Image,
	Input,
	Select,
} from 'antd';
import { scoreGamesService, useAuth, useSchools } from '@etnos/tools';
import { GameNameEnum, type ScoreInterface } from '@etnos/types';
import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { AvatarPickerDrawer, PasswordForm } from '../../@molecules';

export const ProfilePage = () => {
	const [form] = Form.useForm();

	const [isLoading, setIsLoading] = useState(false);
	const [isAvatarDrawerOpen, setIsAvatarDrawerOpen] = useState(false);
	const [isSchoolSaving, setIsSchoolSaving] = useState(false);
	const [score, setScore] = useState<string>();
	const [games, setGames] = useState<ScoreInterface[]>([]);

	const { user, updateUserProfile } = useAuth();
	const { data: schools, isLoading: isLoadingSchools } = useSchools();

	const getScore = useCallback(async () => {
		if (user) {
			const allScore = (await scoreGamesService.getScore(
				user.uid
			)) as ScoreInterface[];

			setGames(allScore);

			if (allScore?.length) {
				setScore(
					allScore.reduce((acc, score) => acc + score.score, 0).toString()
				);
			} else {
				setScore('0');
			}
		}
	}, [user]);

	useEffect(() => {
		if (!user) {
			return;
		}

		form.setFieldsValue({
			childName: user.childName,
			childBirthDate: user.childBirthDate ? dayjs(user.childBirthDate) : null,
			parentName: user.parentName,
			email: user.email,
		});

		getScore();
	}, [user, form, getScore]);

	const onFinish = async (values: {
		childName: string;
		childBirthDate: dayjs.Dayjs | null;
		parentName: string;
		email: string;
	}) => {
		setIsLoading(true);
		await updateUserProfile({
			...values,
			childBirthDate: values.childBirthDate
				? dayjs(values.childBirthDate).format('YYYY-MM-DD')
				: undefined,
		});
		setIsLoading(false);
	};

	const onSaveAvatar = async (avatarUrl: string, characterSlug: string) => {
		await updateUserProfile({
			photoURL: avatarUrl,
			avatarCharacterSlug: characterSlug,
		});
	};

	const onSelectSchool = async (schoolId: string) => {
		setIsSchoolSaving(true);

		try {
			await updateUserProfile({
				school: schoolId,
			});
		} finally {
			setIsSchoolSaving(false);
		}
	};

	if (!user) {
		return null;
	}

	const profileImage = user?.photoURL || `https://robohash.org/${user?.email}`;
	const profileName = user?.childName || (user?.email as string);
	const selectedSchool = schools?.find((school) => school.id === user.school);
	const schoolLabel = selectedSchool?.name || user.school;

	return (
		<div className='flex w-full pt-4 md:flex-row flex-col gap-6'>
			<div className='md:w-1/3'>
				<div className='bg-white p-8 rounded shadow'>
					<div className='flex justify-center w-full'>
						<Image
							src={profileImage}
							alt={profileName}
							width={150}
							height={150}
							className='object-cover object-center w-24 h-24 rounded-full border border-slate-200 mb-4'
						/>
					</div>

					<div className='text-center mb-6 mt-4'>
						<Button
							type='default'
							size='small'
							onClick={() => setIsAvatarDrawerOpen(true)}
						>
							Escolher Avatar
						</Button>
					</div>

					<h2 className='text-md text-center font-bold pb-6 mb-6 border-b-2 border-dotted border-slate-200'>
						{profileName}
					</h2>

					<div className='flex flex-col gap-4'>
						<div className='flex items-center justify-between gap-2 w-full'>
							<span className='text-xs text-slate-800'>Pontuação</span>
							<span className='text-xs font-bold text-black'>{score}</span>
						</div>

						<div className='flex items-center justify-between gap-2 w-full'>
							<span className='text-xs text-slate-800'>Nome da Escola</span>
							<span className='text-xs font-bold text-black'>
								{schoolLabel}
							</span>
						</div>
					</div>
				</div>
			</div>
			<div className='md:w-2/3'>
				<div className='bg-white p-8 rounded shadow'>
					<h2 className='text-xl font-bold text-primary mb-6'>Editar Perfil</h2>

					<Form
						layout='vertical'
						form={form}
						onFinish={onFinish}
						disabled={isLoading}
					>
						<div className='grid grid-cols-1 md:grid-cols-2 md:gap-x-8 w-full'>
							<Form.Item name='childName' label='Nome da Criança'>
								<Input />
							</Form.Item>

							<Form.Item name='childBirthDate' label='Data de Nascimento'>
								<DatePicker className='w-full' format='DD/MM/YYYY' />
							</Form.Item>

							<Form.Item name='parentName' label='Nome Pai/Mãe'>
								<Input />
							</Form.Item>

							<Form.Item name='email' label='Email'>
								<Input disabled />
							</Form.Item>

							<Form.Item label='Escola'>
								{user.school ? (
									<Input value={schoolLabel} disabled />
								) : (
									<Select
										placeholder='Selecione sua escola'
										loading={isLoadingSchools || isSchoolSaving}
										disabled={isLoadingSchools || isSchoolSaving}
										options={schools?.map((school) => ({
											value: school.id,
											label: school.name,
										}))}
										onChange={onSelectSchool}
									/>
								)}
							</Form.Item>
						</div>

						<div className='text-center pt-4 md:text-left'>
							<Button type='primary' htmlType='submit' loading={isLoading}>
								Salvar Alterações
							</Button>
						</div>
					</Form>

					<Divider />

					<div className='mb-6'>
						<h2 className='text-xl font-bold text-primary mb-2'>
							Alterar Senha
						</h2>

						<p className='text-xs text-gray-400'>
							Informe sua senha atual para definir uma nova senha. Se não
							lembrar dela, envie um e-mail de redefinição.
						</p>
					</div>

					<PasswordForm />

					<Divider />

					<h2 className='text-xl font-bold text-primary'>Jogos</h2>

					<p className='text-xs text-gray-400 mb-6'>
						Veja seus melhores resultados nos jogos
					</p>

					<div className='grid md:grid-cols-2 gap-4'>
						{games.map((game) => (
							<div
								key={game.slug}
								className='flex items-center gap-4 w-full overflow-hidden rounded border border-slate-200'
							>
								<Image
									src={`/games/${game.slug}/cover/${game.characterSlug}.jpg`}
									alt={game.slug}
									width={80}
									height={80}
									className='object-cover object-center'
									preview={false}
								/>
								<dl>
									<dt className='text-primary text-xs uppercase'>
										{GameNameEnum[game.slug as keyof typeof GameNameEnum]}
									</dt>
									<dd className='text-xl font-black text-primary'>
										{game.score}
									</dd>
								</dl>
							</div>
						))}
					</div>
				</div>
			</div>

			<Drawer
				open={isAvatarDrawerOpen}
				onClose={() => setIsAvatarDrawerOpen(false)}
				title='Escolher avatar'
				placement='right'
				destroyOnHidden
			>
				<AvatarPickerDrawer
					user={user}
					onClose={() => setIsAvatarDrawerOpen(false)}
					onSaveAvatar={onSaveAvatar}
				/>
			</Drawer>
		</div>
	);
};
