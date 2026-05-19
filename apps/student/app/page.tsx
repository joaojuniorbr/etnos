import { Breadcrumb } from 'antd';
import { Metadata } from 'next';
import { StudentHome } from '@/components/@pages';

export const metadata: Metadata = {
	title: 'Etnos | Área do Estudante',
};

export default function Page() {
	return (
		<div className="container mx-auto py-4 px-6 md:py-10 md:px-0">
			<Breadcrumb
				items={[
					{ title: 'Home', href: '/' },
					{
						title: 'Área do estudante',
					},
				]}
			/>

			<StudentHome />
		</div>
	);
}
