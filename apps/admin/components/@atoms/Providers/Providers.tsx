'use client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { UserProvider, MainLayout } from '@etnos/ui';

const client = new QueryClient();

export function Providers({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<QueryClientProvider client={client}>
			<UserProvider>
				<MainLayout>{children}</MainLayout>
			</UserProvider>
		</QueryClientProvider>
	);
}
