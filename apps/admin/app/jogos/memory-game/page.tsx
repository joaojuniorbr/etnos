import { Breadcrumb, Spin } from 'antd';
import { MemoryGameList } from './MemoryGameList';

export default function JogoDaMemoriaPage() {
	return (
		<Spin spinning={false}>
			<div className='container mx-auto py-4 px-6 md:py-10 md:px-0'>
				<Breadcrumb
					items={[
						{ title: 'Home', href: '/' },
						{
							title: 'Área do administrador',
							href: '/admin',
						},
						{
							title: 'Jogos',
							href: '/admin/jogos',
						},
						{
							title: 'Jogo da Memória',
						},
					]}
				/>

				<MemoryGameList />
			</div>
		</Spin>
	);
}
