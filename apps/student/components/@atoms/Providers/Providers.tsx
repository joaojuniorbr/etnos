'use client';

import { UserProvider } from '@etnos/ui';
import { MainLayout } from '@etnos/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<UserProvider>
				<MainLayout>{children}</MainLayout>
			</UserProvider>
		</QueryClientProvider>
	);
}
