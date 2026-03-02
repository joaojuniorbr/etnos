'use client';

import { UserProvider, MainLayout } from '@etnos/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60_000,
						refetchOnWindowFocus: false,
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
			<UserProvider>
				<MainLayout>{children}</MainLayout>
			</UserProvider>
		</QueryClientProvider>
	);
}
