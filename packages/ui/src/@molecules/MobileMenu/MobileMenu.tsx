import { Drawer, Button, Menu } from 'antd';
import {
	RiMenu3Line,
	RiUserLine,
	RiUserHeartLine,
	RiHomeLine,
} from 'react-icons/ri';
import { UserProfileInterface } from '@etnos/tools';

interface MobileMenuProps {
	open?: boolean;
	toggleDrawer?: () => void;
	user?: UserProfileInterface | null;
	onLogout?: () => void;
}

export const MobileMenu = ({
	toggleDrawer,
	open,
	user,
	onLogout,
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
