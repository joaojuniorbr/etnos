'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { UserProvider } from '../context';
import { MainLayout } from '../@templates';

interface AppProvidersProps {
	children: React.ReactNode;
	showDevtools?: boolean;
}

export const AppProviders = ({
	children,
	showDevtools = false,
}: AppProvidersProps) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60_000,
						refetchOnWindowFocus: false,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<UserProvider>
				<MainLayout>{children}</MainLayout>
			</UserProvider>
			{showDevtools ? <ReactQueryDevtools /> : null}
		</QueryClientProvider>
	);
};
