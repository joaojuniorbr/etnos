import { Breadcrumb } from 'antd';
import { ProfilePage } from '../../components/@pages';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Etnos | Área do Estudante | Perfil',
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
						title: 'Perfil',
					},
				]}
			/>

			<ProfilePage />
		</div>
	);
}
