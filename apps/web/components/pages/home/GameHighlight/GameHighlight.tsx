import Image from 'next/image';

const ICONS = [
	{
		icon: '/images/icons/icon-open-book.svg',
		title: 'Jogo da Memória Cultural',
		color: 'bg-yellow-50',
		isSoon: false,
	},
	{
		icon: '/images/icons/icon-abc.svg',
		title: 'Adivinhe a Palavra',
		color: 'bg-red-50',
		isSoon: false,
	},
	{
		icon: '/images/icons/icon-pallete.svg',
		title: 'Mistura Cultural',
		color: 'bg-green-400/10',
		isSoon: true,
	},
];

export const GameHighlight = () => {
	return (
		<section className='py-20 px-6'>
			<div className='container mx-auto'>
				<div className='text-center mx-auto max-w-3xl mb-10'>
					<h2 className='text-4xl text-primary font-black mb-2'>
						Aprendizado que valoriza a diversidade
					</h2>
					<p className='text-gray-600 text-xl leading-8 px-10'>
						Jogos curtos, lúdicos e educativos que ajudam crianças a reconhecer,
						valorizar e celebrar as diferenças.
					</p>
				</div>

				<div className='grid mx-auto max-w-5xl gap-8 lg:grid-cols-3'>
					{ICONS.map(({ icon, title, color, isSoon }) => (
						<dl
							className='flex items-center bg-white rounded-xl p-4 gap-4'
							key={title}
						>
							<dt
								className={`w-18 h-18 flex items-center justify-center rounded-xl ${color}`}
							>
								<Image src={icon} alt={title} width={28} height={28} />
							</dt>
							<dd className='font-bold text-lg text-black'>
								{title}
								{isSoon && (
									<span className='block text-xs text-gray-500 font-light'>
										(Em breve)
									</span>
								)}
							</dd>
						</dl>
					))}
				</div>
			</div>
		</section>
	);
};
