import { Drawer, Button } from 'antd';
import { RiMenu3Line } from 'react-icons/ri';
import Image from 'next/image';
import brandHorizontal from '../../assets/images/brand-horizontal.png';

interface MobileMenuProps {
	open?: boolean;
	toggleDrawer?: () => void;
}

export const MobileMenu = ({ toggleDrawer, open }: MobileMenuProps) => {
	return (
		<div className='ui:md:hidden'>
			<Button onClick={toggleDrawer} icon={<RiMenu3Line />} />
			<Drawer open={open} onClose={toggleDrawer} title='Etnos'>
				<div className='ui:flex ui:justify-center ui:mb-10'>
					<Image src={brandHorizontal} alt='Etnos' width={180} height={56} />
				</div>
				<div className='ui:flex ui:gap-4 ui:w-full ui:items-center'>
					<Button type='primary' block size='large' href='/login'>
						Entrar
					</Button>
					<Button type='primary' block size='large' href='/cadastro'>
						Cadastrar
					</Button>
				</div>
			</Drawer>
		</div>
	);
};
