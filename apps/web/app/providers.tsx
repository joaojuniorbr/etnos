'use client';

import { useState } from 'react';
import { UserProvider, MainLayout } from '@etnos/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function Providers({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<UserProvider>
				<MainLayout>{children}</MainLayout>
			</UserProvider>
			<ReactQueryDevtools />
		</QueryClientProvider>
	);
}
