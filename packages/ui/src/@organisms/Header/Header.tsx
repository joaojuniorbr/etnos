'use client';

import { Button } from 'antd';
import { HeaderMobile } from './HeaderMobile';
import { useAuth } from '@etnos/tools';
import { useUser } from '../../context';

export const Header = () => {
	const { user } = useUser();
	const { onSignOut } = useAuth();

	const handleOnSignOut = async () => {
		await onSignOut();
		window.open('/login', '_self');
	};

	return (
		<>
			<header className='ui:bg-white ui:shadow-sm ui:w-full ui:py-4 ui:px-8'>
				<div className='ui:container ui:mx-auto'>
					<header className='ui:w-full ui:flex ui:justify-between ui:items-center'>
						<a href='/'>
							<img
								src='/images/brand-horizontal.svg'
								alt='Etnos'
								className='ui:w-32 ui:h-auto'
							/>
						</a>

						<div className='ui:flex ui:items-center ui:gap-4'>
							{user ? (
								<div className='ui:hidden ui:md:flex ui:gap-4 ui:items-center'>
									<div className='ui:flex ui:items-center ui:gap-2'>
										<div className='ui:h-10 ui:w-10 ui:rounded-full ui:overflow-hidden ui:border ui:border-slate-300'>
											<a href='/estudante/perfil'>
												<img
													src={`https://robohash.org/${user.email}.png`}
													alt={user.email as string}
													className='ui:h-10 ui:w-10 ui:object-cover'
												/>
											</a>
										</div>
										<span className='ui:text-primary ui:text-sm'>
											{user?.childName || user?.email}
										</span>
									</div>
									<div className='ui:border-l ui:border-slate-300'>
										<Button type='link' danger onClick={handleOnSignOut}>
											SAIR
										</Button>
									</div>
								</div>
							) : (
								<nav className='ui:gap-4 ui:hidden ui:md:flex'>
									<Button
										type='link'
										className='ui:text-primary!'
										href='/cadastro'
									>
										Cadastrar
									</Button>

									<Button type='primary' href='/login'>
										Entrar
									</Button>
								</nav>
							)}

							<HeaderMobile />
						</div>
					</header>
				</div>
			</header>
		</>
	);
};
