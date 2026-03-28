import type { SchoolInterface } from '@etnos/types';
import { Title } from '@etnos/ui';

interface SchoolDataProps {
	school: SchoolInterface | null;
}

const infoRows = [
	{ label: 'Nome', key: 'name' },
	{ label: 'Cidade', key: 'city' },
	{ label: 'Estado', key: 'state' },
] as const;

export const SchoolData = ({ school }: SchoolDataProps) => {
	return (
		<div className='border border-slate-200 p-6 rounded bg-white'>
			<Title className='mb-4'>Dados da escola</Title>

			<div className='grid gap-4 md:grid-cols-3'>
				{infoRows.map((item) => (
					<div key={item.key} className='space-y-1'>
						<p className='text-xs uppercase tracking-wide text-slate-500'>
							{item.label}
						</p>
						<p className='text-sm font-semibold text-slate-900'>
							{school?.[item.key] ?? '-'}
						</p>
					</div>
				))}
			</div>
		</div>
	);
};
