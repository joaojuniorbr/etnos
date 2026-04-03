import { Breadcrumb, Spin } from 'antd';
import { MemoryGameList } from './MemoryGameList';
import { AuthProtected } from '@etnos/ui';

export default function JogoDaMemoriaPage() {
	return (
		<AuthProtected
			allowedRoles={['admin']}
			forbiddenRedirectTo="/admin/escolas"
		>
			<Spin spinning={false}>
				<div className="container mx-auto py-4 px-6 md:py-10 md:px-0">
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
		</AuthProtected>
	);
}
