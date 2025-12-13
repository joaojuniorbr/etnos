'use client';

import { Breadcrumb } from 'antd';
import { ImageLibrary, useUser } from '@etnos/ui';

export default function MidiasPage() {
	const { user } = useUser();

	return (
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

			<ImageLibrary user={user!} folder='library' limitPage={24} />
		</div>
	);
}
