import { Breadcrumb, Spin } from 'antd';
import { MidiaSelector } from './MidiaSelector';

export default function MidiasPage() {
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
							title: 'Midias',
						},
					]}
				/>

				<MidiaSelector />
			</div>
		</Spin>
	);
}
