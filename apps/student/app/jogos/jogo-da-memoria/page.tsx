import { MemoryGame } from '@etnos/games';
import { Breadcrumb } from 'antd';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Etnos | Jogo da Memória',
};

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
				<MemoryGame />
			</div>
		</div>
	);
}
