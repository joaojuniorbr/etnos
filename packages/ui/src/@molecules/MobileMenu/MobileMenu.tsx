'use client';

import { Drawer, Button, Menu, Image, Modal, Rate, Input, message } from 'antd';
import {
	RiMenu3Line,
	RiUserLine,
	RiUserHeartLine,
	RiHomeLine,
	RiGameLine,
	RiLockStarLine,
	RiStarLine,
	RiImageLine,
	RiSchoolLine,
	RiNotificationLine,
} from 'react-icons/ri';
import type { CharacterInterface, UserProfileInterface } from '@etnos/types';
import { GamesEnum } from '@etnos/types';
import { useGames } from '@etnos/tools';
import { useState } from 'react';

const { TextArea } = Input;

interface MobileMenuProps {
	open?: boolean;
	toggleDrawer?: () => void;
	user?: UserProfileInterface | null;
	onLogout?: () => void;
	toggleCharacter?: () => void;
	selectedCharacter?: CharacterInterface | null;
}

export const MobileMenu = ({
	toggleDrawer,
	open,
	user,
	onLogout,
	toggleCharacter,
	selectedCharacter,
}: MobileMenuProps) => {
	const profileImage = user?.photoURL || `https://robohash.org/${user?.email}`;
	const { submitGameNps } = useGames(user?.uid);
	const [isChooserOpen, setIsChooserOpen] = useState(false);
	const [isNpsOpen, setIsNpsOpen] = useState(false);
	const [selectedGameSlug, setSelectedGameSlug] = useState<GamesEnum | null>(null);
	const [rating, setRating] = useState<number>(0);
	const [comment, setComment] = useState('');
	const [submittingNps, setSubmittingNps] = useState(false);

	const hasAdminAccess =
		user?.role?.includes('admin') || user?.role?.includes('school');
	const isAdmin = user?.role?.includes('admin');

	const canRate = Boolean(user?.uid && selectedCharacter?.slug);

	const openNpsForm = (gameSlug: GamesEnum) => {
		setSelectedGameSlug(gameSlug);
		setIsChooserOpen(false);
		setRating(0);
		setComment('');
		setIsNpsOpen(true);
	};

	const handleSubmitNps = async () => {
		if (!selectedGameSlug || !selectedCharacter?.slug) {
			return;
		}

		if (rating < 1) {
			message.warning('Selecione uma nota de 1 a 5.');
			return;
		}

		setSubmittingNps(true);
		try {
			await submitGameNps(
				selectedGameSlug,
				selectedCharacter.slug,
				rating,
				comment.trim() || undefined,
			);
			setIsNpsOpen(false);
		} finally {
			setSubmittingNps(false);
		}
	};

	return (
		<div className={user ? 'ui:block' : 'ui:md:hidden'}>
			<Button
				onClick={toggleDrawer}
				icon={<RiMenu3Line />}
				type="primary"
				aria-label="Menu"
			/>
			<Drawer
				open={open}
				onClose={toggleDrawer}
				title="Etnos"
				footer={
					user && (
						<Button onClick={onLogout} danger block>
							SAIR
						</Button>
					)
				}
			>
				{user ? (
					<>
						<div className="ui:flex ui:gap-4 ui:items-center ui:pb-6 ui:border-b ui:border-slate-200 ui:mb-2">
							<div className="ui:h-18 ui:w-18 ui:rounded-full ui:overflow-hidden ui:border ui:border-slate-300">
								<a href="/estudante/perfil">
									<img
										src={profileImage}
										alt={user.email as string}
										className="ui:h-18 ui:w-18 ui:object-cover"
									/>
								</a>
							</div>
							<p className="ui:text-primary ui:text-base ui:font-bold ui:text-center">
								{user?.childName || user?.email}
							</p>
						</div>

						{selectedCharacter && (
							<div className="ui:border-b ui:border-slate-200 ui:pb-4 ui:pt-2 ui:mb-2">
								<div className="ui:text-sm ui:font-bold ui:text-primary ui:mb-1 ui:uppercase">
									Personagem Selecionado
								</div>
								<div className="ui:flex ui:gap-4 ui:items-center ui:mb-4">
									<div className="ui:w-20">
										<Image
											src={
												selectedCharacter.imageUrl ||
												`/images/character/md/${selectedCharacter.slug}.png`
											}
											alt={selectedCharacter.name}
											preview={false}
										/>
									</div>
									<div className="ui:flex-1">
										<div className="ui:text-base ui:text-black ui:font-bold">
											{selectedCharacter.name}
										</div>
										<div className="ui:text-xs ui:text-gray-400">
											{selectedCharacter.description}
										</div>
									</div>
								</div>
								<button
									className="ui:text-xs ui:text-primary ui:uppercase ui:underline"
									onClick={toggleCharacter}
									aria-label="Alterar Personagem"
								>
									Alterar Personagem
								</button>
							</div>
						)}
						<Menu
							mode="inline"
							items={[
								{
									key: 'home',
									label: <a href="/">Home</a>,
									icon: <RiHomeLine />,
								},
								{
									key: 'student',
									label: <a href="/estudante">Área do Estudante</a>,
									icon: <RiUserLine />,
								},
								selectedCharacter
									? {
											key: 'games',
											label: <a href="/estudante/jogos">Jogos</a>,
											icon: <RiGameLine />,
									  }
									: null,

								hasAdminAccess
									? {
											key: 'admin',
											label: <a href="/admin">Área do administrador</a>,
											icon: <RiLockStarLine />,
											children: [
												{
													key: 'schools',
													label: <a href="/admin/escolas">Escolas</a>,
													icon: <RiSchoolLine />,
												},
												{
													key: 'notifications',
													label: <a href="/admin/notificacoes">Notificações</a>,
													icon: <RiNotificationLine />,
												},
												...(isAdmin
													? [
															{
																key: 'characters',
																label: (
																	<a href="/admin/personagens">Personagens</a>
																),
																icon: <RiStarLine />,
															},
															{
																key: 'midia',
																label: <a href="/admin/midia">Midia</a>,
																icon: <RiImageLine />,
															},
													  ]
													: []),
											],
									  }
									: null,
								{
									key: 'profile',
									label: <a href="/estudante/perfil">Perfil</a>,
									icon: <RiUserHeartLine />,
								},
							]}
						/>
						{canRate ? (
							<div className="ui:pt-4 ui:mt-4 ui:border-t ui:border-slate-200">
								<Button
									type="primary"
									block
									onClick={() => setIsChooserOpen(true)}
								>
									Fazer avaliação
								</Button>
							</div>
						) : null}
					</>
				) : (
					<>
						<div className="ui:flex ui:justify-center ui:mb-6">
							<a href="/">
								<img
									src="/images/brand-horizontal.svg"
									alt="Etnos"
									className="ui:w-32 ui:h-auto"
								/>
							</a>
						</div>
						<div className="ui:flex ui:gap-4 ui:w-full ui:items-center">
							<Button type="primary" block size="large" href="/login">
								Entrar
							</Button>
							<Button type="primary" block size="large" href="/cadastro">
								Cadastrar
							</Button>
						</div>
					</>
				)}
			</Drawer>
			<Modal
				open={isChooserOpen}
				title="Escolha o jogo para avaliar"
				onCancel={() => setIsChooserOpen(false)}
				footer={null}
			>
				<div className="ui:flex ui:flex-col ui:gap-2">
					<Button block onClick={() => openNpsForm(GamesEnum.MEMORY_GAME)}>
						Jogo da Memória
					</Button>
					<Button block onClick={() => openNpsForm(GamesEnum.GUESS_GAME)}>
						Adivinhe
					</Button>
				</div>
			</Modal>
			<Modal
				open={isNpsOpen}
				title="Como foi sua experiência?"
				onCancel={() => setIsNpsOpen(false)}
				footer={null}
			>
				<p className="ui:text-slate-600 ui:mb-4 ui:m-0">
					De 1 a 5, o quanto você gostou deste jogo?
				</p>
				<div className="ui:flex ui:justify-center ui:mb-4">
					<Rate count={5} value={rating} onChange={setRating} />
				</div>
				<TextArea
					placeholder="Quer contar algo a mais? (opcional)"
					value={comment}
					onChange={(event) => setComment(event.target.value)}
					maxLength={2000}
					showCount
					rows={3}
					className="ui:mb-4"
				/>
				<div className="ui:flex ui:flex-col-reverse ui:sm:flex-row ui:gap-2 ui:sm:justify-end">
					<Button onClick={() => setIsNpsOpen(false)} disabled={submittingNps}>
						Cancelar
					</Button>
					<Button
						type="primary"
						onClick={() => void handleSubmitNps()}
						loading={submittingNps}
						disabled={submittingNps}
					>
						Enviar
					</Button>
				</div>
			</Modal>
		</div>
	);
};
