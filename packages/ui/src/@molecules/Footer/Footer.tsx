import Image from 'next/image';
import brandHorizontal from '@etnos/ui/assets/images/brand-horizontal.png';

export const Footer = () => (
	<div className='ui:py-4 ui:px-8 ui:bg-white ui:shadow-sm'>
		<div className='ui:container ui:mx-auto'>
			<footer className='ui:w-full ui:flex ui:flex-col ui:gap-4 ui:justify-between ui:items-center ui:md:flex-row'>
				<a href='/'>
					<Image src={brandHorizontal} alt='Etnos' width={70} height={16} />
				</a>

				<small className='ui:text-xs ui:text-slate-400'>
					Etnos &copy; {new Date().getFullYear()}. Todos os Direitos Reservados
				</small>
			</footer>
		</div>
	</div>
);
