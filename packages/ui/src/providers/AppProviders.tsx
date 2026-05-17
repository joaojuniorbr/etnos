'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MixpanelProvider } from '@etnos/analytics/web';
import type { AnalyticsAppName } from '@etnos/analytics';
import { UserProvider } from '../context';
import { MainLayout } from '../@templates';

interface AppProvidersProps {
	children: React.ReactNode;
	showDevtools?: boolean;
	appName?: AnalyticsAppName;
}

export const AppProviders = ({
	children,
	showDevtools = false,
	appName = 'web',
}: AppProvidersProps) => {
	const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

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
			<MixpanelProvider appName={appName} projectToken={mixpanelToken}>
				<UserProvider>
					<MainLayout>{children}</MainLayout>
				</UserProvider>
			</MixpanelProvider>
			{showDevtools ? <ReactQueryDevtools /> : null}
		</QueryClientProvider>
	);
};
