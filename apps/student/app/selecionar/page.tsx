import { Breadcrumb } from 'antd';
import { Metadata } from 'next';
import { CharacterSelect } from '../../components/@organisms';

export const metadata: Metadata = {
	title: 'Etnos | Selecionar Personagem',
};

export default function Page() {
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
						title: 'Selecionar Personagem',
					},
				]}
			/>

			<div className='py-8 px-4 bg-slate-50 border border-slate-200 shadow rounded mt-6'>
				<div className='mx-auto md:max-w-xl text-center'>
					<h1 className='text-3xl font-black text-primary'>
						Escolha seu guia cultural!
					</h1>

					<p className='text-slate-600 mb-2'>
						Cada personagem representa uma região do Brasil e vai te acompanhar
						em uma jornada cheia de descobertas, histórias e desafios.
					</p>

					<p className='text-slate-600 mb-4'>
						Escolha quem vai ser seu parceiro de aventura e prepare-se para
						aprender brincando!
					</p>

					<CharacterSelect />
				</div>
			</div>
		</div>
	);
}
