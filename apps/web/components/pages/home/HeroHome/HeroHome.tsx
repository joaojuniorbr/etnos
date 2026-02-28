import { Button } from '@etnos/ui';
import Image from 'next/image';
import Link from 'next/link';

export const HeroHome = () => {
	return (
		<section className='relative px-6 pt-10 lg:py-12 xl:py-20'>
			<div className='container mx-auto'>
				<div className='flex items-center flex-col gap-8 lg:gap-0 lg:flex-row'>
					<article className='flex-1 text-center lg:text-left 2xl:pr-40'>
						<h2 className='text-xl font-black text-primary md:text-3xl xl:text-5xl'>
							APRENDER É RECONHECER
						</h2>
						<h3 className='text-base font-light text-primary mb-3 md:font-semibold md:text-lg xl:text-2xl'>
							Descubra culturas, respeite diferenças, transforme o futuro.
						</h3>

						<p className='text-xs leading-5 text-primary mb-6 md:text-base md:leading-normal xl:text-lg md:mb-10'>
							Oferecemos a cada estudante a oportunidade de aprender sobre
							diversidade, respeito e identidade cultural de forma lúdica e
							envolvente. Com Etnos, a jornada do conhecimento se transforma em
							empatia, inclusão e valorização das diferenças que constroem nossa
							sociedade.
						</p>

						<Link href='/cadastro'>
							<Button type='secondary' size='xl'>
								COMECE AGORA
							</Button>
						</Link>
					</article>
					<div className='lg:w-140'>
						<Image
							src='/images/landing/hero.png'
							alt='Aprender é reconhecer'
							height={520}
							width={446}
							className='w-full h-auto'
							priority
						/>
					</div>
				</div>
			</div>
		</section>
	);
};
