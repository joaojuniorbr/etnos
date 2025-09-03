'use client';

import Image from 'next/image';
import { brandHorizontal } from '../../assets';
import { Button, Drawer } from 'antd';
import { useState } from 'react';
import { RiMenu3Line } from 'react-icons/ri';

export const Header = () => {
	const [open, setOpen] = useState(false);

	const toggleDrawer = () => setOpen(!open);

	return (
		<>
			<header className='ui:bg-white ui:shadow-sm ui:w-full ui:py-4 ui:px-8'>
				<div className='ui:container ui:mx-auto'>
					<header className='ui:w-full ui:flex ui:justify-between ui:items-center'>
						<a href='/'>
							<Image
								src={brandHorizontal}
								alt='Etnos'
								width={120}
								height={24}
							/>
						</a>

						<nav className='ui:gap-4 ui:hidden ui:md:flex'>
							<Button type='link' className='ui:text-primary!' href='/cadastro'>
								Cadastrar
							</Button>

							<Button type='primary' href='/login'>
								Entrar
							</Button>
						</nav>

						<div className='ui:md:hidden'>
							<Button onClick={toggleDrawer} icon={<RiMenu3Line />} />
						</div>
					</header>
				</div>
			</header>
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
		</>
	);
};
