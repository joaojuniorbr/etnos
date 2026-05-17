import '@etnos/ui/styles.css';
import './globals.css';

import type { Metadata } from 'next';
import { AppProviders } from '@etnos/ui';

export const metadata: Metadata = {
	title: 'Etnos',
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<AppProviders appName="web" showDevtools>
			{children}
		</AppProviders>
	);
}
