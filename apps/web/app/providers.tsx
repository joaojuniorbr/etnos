'use client';

import { UserProvider, MainLayout } from '@etnos/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

export function Providers({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<QueryClientProvider client={queryClient}>
			<UserProvider>
				<MainLayout>{children}</MainLayout>
			</UserProvider>
			<ReactQueryDevtools />
		</QueryClientProvider>
	);
}
