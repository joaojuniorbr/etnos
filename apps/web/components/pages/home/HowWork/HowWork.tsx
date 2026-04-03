import Image from 'next/image';

const ITEMS = [
	{
		image: '/images/landing/work-learn.png',
		title: 'Aprendizado com propósito',
		content:
			'Os jogos são guiados por valores como respeito, empatia e valorização das culturas brasileiras e asiáticas.',
	},
	{
		image: '/images/landing/work-games.png',
		title: 'Jogos envolventes',
		content:
			'Atividades curtas e lúdicas que despertam o interesse e valorizam culturas diversas.',
	},
	{
		image: '/images/landing/work-access.png',
		title: 'Acesso gratuito',
		content:
			'Todos os jogos são gratuitos e pensados para crianças do 5º ano, com linguagem simples e visual atrativo.',
	},
];

export const HowWork = () => (
	<section className="py-10 md:py-20 lg:py-32 px-6 relative">
		<div className="container mx-auto relative z-10">
			<h2 className="uppercase text-xl text-primary font-black md:text-4xl text-center mb-4 md:mb-6 lg:mb-10">
				Como funciona o Etnos?
			</h2>

			<div className="grid mx-auto gap-4 md:grid-cols-3 md:gap-4 lg:gap-8 xl:max-w-7xl">
				{ITEMS.map((item) => (
					<div
						className="bg-white overflow-hidden rounded-xl max-w-100 md:max-w-full mx-auto"
						key={item.title}
					>
						<Image
							src={item.image}
							alt={item.title}
							width={400}
							height={200}
							className="w-full"
						/>
						<div className="text-center pb-6 px-6 md:pb-6 lg:px-8 lg:pb-10">
							<h3 className="font-bold text-lg leading-5 lg:text-3xl lg:leading-8 mb-2">
								{item.title}
							</h3>
							<p className="text-xs md:text-sm md:leading-5 lg:text-lg lg:leading-8 m-0">
								{item.content}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>

		<div className="bg-secondary h-[50%] w-full bottom-0 left-0 absolute hidden md:block" />
	</section>
);
