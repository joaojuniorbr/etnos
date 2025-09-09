import { Drawer, Button } from 'antd';
import { RiMenu3Line } from 'react-icons/ri';
import Image from 'next/image';
import brandHorizontal from '@etnos/ui/assets/images/brand-horizontal.png';
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
		<div className='ui:md:hidden'>
			<Button onClick={toggleDrawer} icon={<RiMenu3Line />} />
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
				<div className='ui:flex ui:justify-center ui:mb-10'>
					<a href='/'>
						<Image src={brandHorizontal} alt='Etnos' width={180} height={56} />
					</a>
				</div>
				{user ? (
					<div className='ui:flex ui:flex-col ui:gap-4 ui:items-center ui:mt-6 ui:pt-6 ui:border-t ui:border-slate-200'>
						<div className='ui:h-24 ui:w-24 ui:rounded-full ui:overflow-hidden ui:border ui:border-slate-300'>
							<a href='/estudante'>
								<img
									src={`https://robohash.org/${user.email}.png`}
									alt={user.email as string}
									className='ui:h-24 ui:w-24 ui:object-cover'
								/>
							</a>
						</div>
						<p className='ui:text-primary ui:text-base ui:font-bold ui:text-center'>
							{user?.childName || user?.email}
						</p>
					</div>
				) : (
					<div className='ui:flex ui:gap-4 ui:w-full ui:items-center'>
						<Button type='primary' block size='large' href='/login'>
							Entrar
						</Button>
						<Button type='primary' block size='large' href='/cadastro'>
							Cadastrar
						</Button>
					</div>
				)}
			</Drawer>
		</div>
	);
};
