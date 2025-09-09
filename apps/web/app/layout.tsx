import '@etnos/ui/styles.css';
import './globals.css';

import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
	title: 'Etnos',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <Providers>{children}</Providers>;
}
