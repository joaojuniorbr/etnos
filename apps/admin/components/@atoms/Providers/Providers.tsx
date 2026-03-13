'use client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { UserProvider, MainLayout } from '@etnos/ui';
import { useState } from 'react';

export function Providers({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const [client] = useState(
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
		<QueryClientProvider client={client}>
			<UserProvider>
				<MainLayout>{children}</MainLayout>
			</UserProvider>
		</QueryClientProvider>
	);
}
