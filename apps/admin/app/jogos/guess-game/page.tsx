import { Breadcrumb, Spin } from 'antd';
import { AuthProtected } from '@etnos/ui';
import { GuessGameList } from './GuessGameList';

export default function JogoAdivinhePage() {
	return (
		<AuthProtected allowedRoles={['admin']} forbiddenRedirectTo='/admin/escolas'>
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
								title: 'Jogo Adivinhe',
							},
						]}
					/>

					<GuessGameList />
				</div>
			</Spin>
		</AuthProtected>
	);
}
