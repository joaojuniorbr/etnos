'use client';

import { Breadcrumb } from 'antd';
import { AuthProtected, MidiaManager, Title, useUser } from '@etnos/ui';

export default function MidiasPage() {
	const { user } = useUser();

	return (
		<AuthProtected
			allowedRoles={['admin']}
			forbiddenRedirectTo="/admin/escolas"
		>
			<div className="container mx-auto py-4 px-6 md:py-10 md:px-0">
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

				<Title className="mb-4 mt-6">Mídias</Title>

				<MidiaManager user={user!} uploadFolder="library" limitPage={24} showAll />
			</div>
		</AuthProtected>
	);
}
