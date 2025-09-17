import { Button } from 'antd';
import Image from 'next/image';

import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Etnos',
};

export default function Page() {
	return (
		<>
			<section className='relative p-8 lg:p-0'>
				<div className='container mx-auto'>
					<div className='flex items-center flex-col gap-8 lg:gap-0 lg:flex-row'>
						<article className='flex-1 text-center lg:text-left lg:pr-20 xl:pr-30 2xl:pr-40'>
							<h2 className='text-3xl font-black text-primary xl:text-4xl'>
								APRENDER É RECONHECER
							</h2>
							<h3 className='text-lg font-semibold text-primary mb-3 xl:text-2xl'>
								Descubra culturas, respeite diferenças, transforme o futuro.
							</h3>
							<p className='text-slate-600 mb-10 xl:text-lg'>
								Oferecemos a cada estudante a oportunidade de aprender sobre
								diversidade, respeito e identidade cultural de forma lúdica e
								envolvente. Com Etnos, a jornada do conhecimento se transforma
								em empatia, inclusão e valorização das diferenças que constroem
								nossa sociedade.
							</p>

							<Button type='primary' size='large'>
								COMECE AGORA
							</Button>
						</article>
						<Image
							src='/images/landing/hero.png'
							alt='Aprender é reconhecer'
							height={500}
							width={500}
							className='w-80 h-auto xl:w-120 2xl:w-130'
						/>
					</div>
				</div>
			</section>
		</>
	);
}
