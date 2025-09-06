'use client';

import { UserProvider } from '@etnos/ui';
import { MainLayout } from '@etnos/ui';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<UserProvider>
			<MainLayout>{children}</MainLayout>
		</UserProvider>
	);
}
