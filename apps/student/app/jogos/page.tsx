import { Breadcrumb } from 'antd';
import { Metadata } from 'next';
import { GameSelect } from '../../components/@organisms';

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
						title: 'Jogos',
					},
				]}
			/>

			<div className='py-8 px-4 bg-slate-50 border border-slate-200 shadow rounded mt-6'>
				<div className='mx-auto md:max-w-xl text-center'>
					<h1 className='text-3xl font-black text-primary'>
						Escolha seu jogo!
					</h1>

					<p className='text-slate-600 mb-2'>
						Agora que você já escolheu seu guia cultural, é hora de decidir como
						vai começar sua jornada pelo Brasil. Cada jogo traz uma forma
						diferente de aprender, brincar e se conectar com as tradições do
						nosso povo.
					</p>

					<p className='text-slate-600 mb-4'>
						Qual desafio você quer encarar primeiro?
					</p>

					<GameSelect />
				</div>
			</div>
		</div>
	);
}
