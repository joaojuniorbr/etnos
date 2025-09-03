import Image from 'next/image';
import { brandHorizontal } from '../../assets';

export const Footer = () => (
	<footer className='ui:py-4 ui:px-8 ui:bg-white ui:w-full ui:flex ui:justify-between ui:items-center ui:shadow-sm'>
		<a href='/'>
			<Image src={brandHorizontal} alt='Etnos' width={70} height={16} />
		</a>

		<small className='ui:text-xs ui:text-slate-400'>
			Etnos &copy; {new Date().getFullYear()}. Todos os Direitos Reservados
		</small>
	</footer>
);
