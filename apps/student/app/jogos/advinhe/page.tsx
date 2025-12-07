import { Breadcrumb } from 'antd';
import { Metadata } from 'next';
import { Games } from '../../../components/@molecules';

export const metadata: Metadata = {
	title: 'Etnos | Adivinhe',
};

export default async function GuessGamePage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
	const params = await searchParams;
	const character = params?.personagem;

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
						title: 'Adivinhe',
					},
				]}
			/>

			<div className='p-4 bg-white border border-slate-200 shadow rounded mt-6'>
				<Games type='guess-game' characterSlug={character} />
			</div>
		</div>
	);
}
