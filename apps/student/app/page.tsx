import { Breadcrumb, Button, Image } from 'antd';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Etnos | Área do Estudante',
};

export default function Page() {
	return (
		<div className='container mx-auto py-4 px-6 md:py-10 md:px-0'>
			<Breadcrumb
				items={[
					{ title: 'Home', href: '/' },
					{
						title: 'Área do estudante',
					},
				]}
			/>

			<div className='py-8 px-4 bg-slate-50 border border-slate-200 shadow rounded mt-6'>
				<div className='mx-auto max-w-md text-center'>
					<h1 className='text-3xl font-black text-primary'>
						BEM-VINDO AO ETNOS!
					</h1>

					<h2 className='text-lg font-semibold text-primary mb-4'>
						Aqui, cada jogo é uma viagem pela cultura brasileira.
					</h2>

					<p className='text-slate-600 mb-2'>
						Você está prestes a conhecer histórias, ritmos, sabores e tradições
						de diferentes regiões do Brasil — tudo de forma divertida,
						interativa e cheia de significado.
					</p>

					<p className='text-slate-600 mb-4'>
						Com a ajuda dos nossos personagens, você vai aprender brincando
						sobre os povos indígenas, afro-brasileiros, nordestinos, sulistas e
						muito mais.
					</p>

					<figure className='flex justify-center mb-6'>
						<Image
							src='/estudante/persona-group.jpg'
							alt='Etnos'
							className='w-full h-auto'
						/>
					</figure>

					<Button href='/estudante/selecionar' type='primary' size='large'>
						Iniciar a Jornada
					</Button>
				</div>
			</div>
		</div>
	);
}
