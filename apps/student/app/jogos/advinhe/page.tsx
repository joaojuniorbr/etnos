import { Metadata } from 'next';
import { GameLayout, GamePageParams } from '../../../components/@organisms';

export const metadata: Metadata = {
	title: 'Etnos | Adivinhe',
};

export default async function GuessGamePage({
	searchParams,
}: Readonly<GamePageParams>) {
	return (
		<GameLayout
			gameType='guess-game'
			breadcrumbTitle='Adivinhe'
			params={searchParams}
		/>
	);
}
