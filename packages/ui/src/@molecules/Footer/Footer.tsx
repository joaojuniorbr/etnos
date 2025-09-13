export const Footer = () => (
	<div className='ui:py-6 ui:px-8 ui:bg-white ui:shadow-[0px_-4px_4px_0px_rgba(0,_0,_0,_0.05)] ui:z-5'>
		<div className='ui:container ui:mx-auto'>
			<footer className='ui:w-full ui:flex ui:flex-col ui:gap-4 ui:justify-between ui:items-center ui:md:flex-row'>
				<a href='/'>
					<img
						src='/images/brand-horizontal.svg'
						alt='Etnos'
						className='ui:w-20 ui:h-auto'
					/>
				</a>

				<small className='ui:text-xs ui:text-slate-400'>
					Etnos &copy; {new Date().getFullYear()}. Todos os Direitos Reservados
				</small>
			</footer>
		</div>
	</div>
);
