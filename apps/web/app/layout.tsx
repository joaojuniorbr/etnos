import '@etnos/ui/styles.css';
import './globals.css';

import type { Metadata } from 'next';
import { Providers } from './providers';
import { QueryProvider } from '../hooks/QueryProvider';

export const metadata: Metadata = {
	title: 'Etnos',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<QueryProvider>
			<Providers>{children}</Providers>
		</QueryProvider>
	);
}
