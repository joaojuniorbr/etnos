import { Drawer, Button, Menu } from 'antd';
import {
	RiMenu3Line,
	RiUserLine,
	RiUserHeartLine,
	RiHomeLine,
} from 'react-icons/ri';
import { CharacterInterface, UserProfileInterface } from '@etnos/tools';
import { Image } from 'antd';

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
	return (
		<div className={user ? 'ui:block' : 'ui:md:hidden'}>
			<Button onClick={toggleDrawer} icon={<RiMenu3Line />} type='primary' />
			<Drawer
				open={open}
				onClose={toggleDrawer}
				title='Etnos'
				footer={
					<Button onClick={onLogout} danger block>
						SAIR
					</Button>
				}
			>
				{user ? (
					<>
						<div className='ui:flex ui:gap-4 ui:items-center ui:pb-6 ui:border-b ui:border-slate-200 ui:mb-2'>
							<div className='ui:h-18 ui:w-18 ui:rounded-full ui:overflow-hidden ui:border ui:border-slate-300'>
								<a href='/estudante/perfil'>
									<img
										src={`https://robohash.org/${user.email}.png`}
										alt={user.email as string}
										className='ui:h-18 ui:w-18 ui:object-cover'
									/>
								</a>
							</div>
							<p className='ui:text-primary ui:text-base ui:font-bold ui:text-center'>
								{user?.childName || user?.email}
							</p>
						</div>

						{selectedCharacter && (
							<div className='ui:border-b ui:border-slate-200 ui:pb-4 ui:pt-2 ui:mb-2'>
								<div className='ui:text-sm ui:font-bold ui:text-primary ui:mb-1 ui:uppercase'>
									Personagem Selecionado
								</div>
								<div className='ui:flex ui:gap-4 ui:items-center ui:mb-4'>
									<div className='ui:w-20'>
										<Image
											src={`/images/character/md/${selectedCharacter.slug}.png`}
											alt={selectedCharacter.name}
											preview={false}
										/>
									</div>
									<div className='ui:flex-1'>
										<div className='ui:text-base ui:text-black ui:font-bold'>
											{selectedCharacter.name}
										</div>
										<div className='ui:text-xs ui:text-gray-400'>
											{selectedCharacter.description}
										</div>
									</div>
								</div>
								<button
									className='ui:text-xs ui:text-primary ui:uppercase ui:underline'
									onClick={toggleCharacter}
								>
									Alterar Personagem
								</button>
							</div>
						)}
						<Menu
							items={[
								{
									key: 'home',
									label: <a href='/'>Home</a>,
									icon: <RiHomeLine />,
								},
								{
									key: 'student',
									label: <a href='/estudante'>Área do Estudante</a>,
									icon: <RiUserLine />,
								},
								{
									key: 'profile',
									label: <a href='/estudante/perfil'>Perfil</a>,
									icon: <RiUserHeartLine />,
								},
							]}
						/>
					</>
				) : (
					<>
						<div className='ui:flex ui:justify-center ui:mb-6'>
							<a href='/'>
								<img
									src='/images/brand-horizontal.svg'
									alt='Etnos'
									className='ui:w-32 ui:h-auto'
								/>
							</a>
						</div>
						<div className='ui:flex ui:gap-4 ui:w-full ui:items-center'>
							<Button type='primary' block size='large' href='/login'>
								Entrar
							</Button>
							<Button type='primary' block size='large' href='/cadastro'>
								Cadastrar
							</Button>
						</div>
					</>
				)}
			</Drawer>
		</div>
	);
};
