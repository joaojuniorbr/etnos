import { Button } from '@etnos/ui';
import { Image } from 'antd';
import Link from 'next/link';

export const Journey = () => (
	<section className='p-6 md:py-16 lg:py-20'>
		<div className='max-w-5xl mx-auto text-center'>
			<h2 className='uppercase text-xl text-primary font-black md:text-4xl mb-2'>
				Pronto para começar sua jornada?
			</h2>
			<p className='text-sm md:text-base mb-8 lg:text-xl lg:leading-7'>
				Descubra culturas, aprenda com respeito e jogue de forma divertida e
				educativa. Cadastre-se gratuitamente e mergulhe em experiências que
				transformam o conhecimento em empatia.
			</p>

			<Link href='/login'>
				<Button type='secondary' size='xl'>
					COMECE AGORA
				</Button>
			</Link>

			<div className='bg-white max-w-240 mx-auto shadow-xl mt-10 p-6 rounded md:rounded-2xl md:p-10 lg:p-12'>
				<Image
					preview={false}
					src='/estudante/persona-group.jpg'
					className='w-full'
				/>
			</div>
		</div>
	</section>
);
