'use client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { UserProvider, MainLayout } from '@etnos/ui';

const client = new QueryClient();

export function Providers({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<UserProvider>
			<QueryClientProvider client={client}>
				<MainLayout>{children}</MainLayout>
			</QueryClientProvider>
		</UserProvider>
	);
}
