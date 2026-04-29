import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, CharacterSelectionProvider } from '@/contexts';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
						staleTime: 60_000,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<CharacterSelectionProvider>{children}</CharacterSelectionProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
};
