import '@etnos/ui/styles.css';
import './globals.css';

import type { Metadata } from 'next';
import { AppProviders, AuthProtected } from '@etnos/ui';
import { RequireStudentSchool } from '@/components/@templates';

export const metadata: Metadata = {
	title: 'Etnos | Área do Estudante',
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<AppProviders>
			<AuthProtected>
				<RequireStudentSchool>{children}</RequireStudentSchool>
			</AuthProtected>
		</AppProviders>
	);
}
