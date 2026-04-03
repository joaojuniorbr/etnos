import { Metadata } from 'next';
import { GameLayout, GamePageParams } from '@/components/@organisms';

export const metadata: Metadata = {
	title: 'Etnos | Jogo da Memória',
};

export default async function MemoryGamePage({
	searchParams,
}: Readonly<GamePageParams>) {
	return (
		<GameLayout
			gameType="memory-game"
			breadcrumbTitle="Jogo da Memória"
			params={searchParams}
		/>
	);
}
