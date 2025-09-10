import '@etnos/ui/styles.css';
import './globals.css';

import type { Metadata } from 'next';
import { AuthProtected, Providers } from '../components/@atoms';

export const metadata: Metadata = {
	title: 'Etnos | Área do Administrador',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Providers>
			<AuthProtected>{children}</AuthProtected>
		</Providers>
	);
}
