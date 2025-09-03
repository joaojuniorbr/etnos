import Image from 'next/image';
import { brandHorizontal } from '../../assets';
import { Button } from 'antd';

export const Header = () => {
	return (
		<header className='ui:py-4 ui:px-8 ui:bg-white ui:w-full ui:flex ui:justify-between ui:items-center ui:shadow-sm'>
			<a href='/'>
				<Image src={brandHorizontal} alt='Etnos' width={120} height={24} />
			</a>

			<nav className='ui:flex ui:gap-4'>
				<Button type='link' className='ui:text-primary!'>
					Cadastrar
				</Button>

				<Button type='primary'>Entrar</Button>
			</nav>
		</header>
	);
};
