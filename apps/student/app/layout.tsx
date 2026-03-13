import '@etnos/ui/styles.css';
import '@etnos/games/styles.css';
import './globals.css';

import type { Metadata } from 'next';
import { AppProviders, AuthProtected } from '@etnos/ui';

export const metadata: Metadata = {
	title: 'Etnos | Área do Estudante',
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<AppProviders>
			<AuthProtected>{children}</AuthProtected>
		</AppProviders>
	);
}
