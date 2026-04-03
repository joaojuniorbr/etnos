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
		<section className="py-10 md:py-20 px-6">
			<div className="container mx-auto">
				<div className="text-center mx-auto max-w-3xl mb-6 lg:mb-10">
					<h2 className="uppercase text-xl text-primary font-black mb-2 md:text-4xl">
						Aprendizado que valoriza a diversidade
					</h2>
					<p className="text-gray-600 text-base md:px-10 lg:leading-8 lg:text-xl">
						Jogos curtos, lúdicos e educativos que ajudam crianças a reconhecer,
						valorizar e celebrar as diferenças.
					</p>
				</div>

				<div className="grid mx-auto max-w-5xl gap-4 lg:gap-8 md:grid-cols-3">
					{ICONS.map(({ icon, title, color, isSoon }) => (
						<dl
							className="flex items-center bg-white rounded-xl p-2 lg:p-4 gap-4"
							key={title}
						>
							<dt
								className={`w-14 h-14 flex items-center justify-center rounded-xl lg:w-18 lg:h-18 ${color}`}
							>
								<Image src={icon} alt={title} width={28} height={28} />
							</dt>
							<dd className="font-bold text-base text-black lg:text-lg">
								{title}
								{isSoon && (
									<span className="block text-xs text-gray-500 font-light">
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
