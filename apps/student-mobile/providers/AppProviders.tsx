import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initMixpanelNative } from '@etnos/analytics/native';
import { AuthProvider, CharacterSelectionProvider } from '@/contexts';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
	useEffect(() => {
		void initMixpanelNative('student-mobile');
	}, []);

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
