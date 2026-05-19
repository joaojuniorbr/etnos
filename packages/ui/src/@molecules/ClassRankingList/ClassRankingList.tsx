import type { StudentDashboardRankingEntryInterface } from '@etnos/types';

export interface ClassRankingListProps {
	entries: StudentDashboardRankingEntryInterface[];
}

const medalColors: Record<number, string> = {
	1: 'ui:bg-secondary ui:text-primary',
	2: 'ui:bg-slate-300 ui:text-primary',
	3: 'ui:bg-amber-700 ui:text-white',
};

export const ClassRankingList = ({ entries }: ClassRankingListProps) => (
	<>
		{entries.length === 0 ? (
			<p className="ui:m-0 ui:text-sm ui:text-slate-500">
				Ranking indisponível. Vincule-se a uma escola para ver sua posição.
			</p>
		) : (
			<ul className="ui:m-0 ui:flex ui:list-none ui:flex-col ui:gap-2 ui:p-0">
				{entries.map((entry) => (
					<li
						key={`${entry.rank}-${entry.name}`}
						className={`ui:flex ui:items-center ui:gap-3 ui:py-2 ${
							entry.isCurrentUser ? 'ui:bg-secondary/10 ui:px-4 ui:-mx-4' : ''
						}`}
					>
						<span
							className={`ui:flex ui:h-8 ui:w-8 ui:shrink-0 ui:items-center ui:justify-center ui:rounded-full ui:text-xs ui:font-black ${
								medalColors[entry.rank] ?? 'ui:bg-primary/10 ui:text-primary'
							}`}
						>
							{entry.rank}
						</span>
						<span className="ui:flex ui:h-7 ui:w-7 ui:shrink-0 ui:items-center ui:justify-center ui:rounded-full ui:bg-primary ui:text-xs ui:font-bold ui:text-white">
							{entry.initials}
						</span>
						<span className="ui:flex-1 ui:font-semibold ui:text-primary">
							{entry.name}
							{entry.isCurrentUser ? (
								<span className="ui:ml-1 ui:font-normal ui:text-slate-500">
									(você)
								</span>
							) : null}
						</span>
						<span className="ui:font-black ui:text-primary">
							{entry.score.toLocaleString('pt-BR')}
						</span>
					</li>
				))}
			</ul>
		)}
	</>
);
