import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Etnos | Selecione sua escola',
};

export default function OnboardingLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return children;
}
