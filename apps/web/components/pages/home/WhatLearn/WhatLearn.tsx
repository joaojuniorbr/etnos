import Image from 'next/image';

import { RiCheckFill } from 'react-icons/ri';

const ITEMS = [
	'Desenvolve empatia e respeito pelas diferenças culturais;',
	'Reconhece a importância da ancestralidade e da identidade;',
	'Aprende de forma lúdica sobre povos afro-brasileiros, indígenas e asiáticos.',
];

export const WhatLearn = () => {
	return (
		<section className='pb-20 md:py-20 px-6 bg-white'>
			<div className='container mx-auto'>
				<div className='flex items-center gap-4 flex-col lg:flex-row'>
					<div className='mx-auto lg:mx-0 max-w-140 w-full'>
						<Image
							src='/images/landing/what-learn.png'
							alt='O que as crianças aprendem?'
							width={633}
							height={590}
							className='w-full'
							priority
						/>
					</div>
					<div className='flex-1'>
						<h2 className='text-2xl text-primary font-black mb-4 md:text-4xl md:mb-8'>
							O que seu filho aprende com Etnos?
						</h2>
						<ul className='text-base text-black gap-4 flex flex-col md:text-xl md:gap-6'>
							{ITEMS.map((item) => (
								<li className='flex flex-row items-start gap-2' key={item}>
									<i className='relative bg-[#918CFF] items-center gap-2 flex  justify-center rounded-full w-5 h-5 top-0.5 md:w-7 md:h-7 md:top-0'>
										<RiCheckFill className='text-white' />
									</i>
									<span className='flex-1'>{item}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
};
