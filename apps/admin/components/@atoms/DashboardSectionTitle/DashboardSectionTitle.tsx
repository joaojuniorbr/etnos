import type { ReactNode } from 'react';

interface DashboardSectionTitleProps {
	children: ReactNode;
}

export const DashboardSectionTitle = ({
	children,
}: DashboardSectionTitleProps) => (
	<h3 className="text-sm font-bold uppercase text-slate-700 mb-2">{children}</h3>
);
