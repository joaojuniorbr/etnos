'use client';

import { UserProvider, MainLayout } from '@etnos/ui';

export function Providers({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<UserProvider>
			<MainLayout>{children}</MainLayout>
		</UserProvider>
	);
}
