import { MemoryGame } from '@etnos/games';
import { Breadcrumb } from 'antd';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Etnos | Jogo da Memória',
};

const cardsData = [
	{
		name: 'vitoria-regia',
		image: '/games/memory-game/iara/cards/vitoria-regia.jpg',
	},
	{
		name: 'acai',
		image: '/games/memory-game/iara/cards/acai.jpg',
	},
	{
		name: 'curipira',
		image: '/games/memory-game/iara/cards/curipira.jpg',
	},
	{
		name: 'guarana',
		image: '/games/memory-game/iara/cards/guarana.jpg',
	},
	{
		name: 'onca-pintada',
		image: '/games/memory-game/iara/cards/onca-pintada.jpg',
	},
	{
		name: 'peixe-boi',
		image: '/games/memory-game/iara/cards/peixe-boi.jpg',
	},
	{
		name: 'seringueira',
		image: '/games/memory-game/iara/cards/seringueira.jpg',
	},
	{
		name: 'uirapuru',
		image: '/games/memory-game/iara/cards/uirapuru.jpg',
	},
];

export default function MemoryGamePage() {
	return (
		<div className='container mx-auto py-4 px-6 md:py-10 md:px-0'>
			<Breadcrumb
				items={[
					{ title: 'Home', href: '/' },
					{
						title: 'Área do estudante',
						href: '/estudante',
					},
					{
						title: 'Jogos',
						href: '/estudante/jogos',
					},
					{
						title: 'Jogo da Memória',
					},
				]}
			/>

			<div className='p-4 bg-white border border-slate-200 shadow rounded mt-6'>
				<MemoryGame cardsData={cardsData} />
			</div>
		</div>
	);
}
