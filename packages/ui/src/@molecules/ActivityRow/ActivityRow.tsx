import type { StudentDashboardActivityInterface } from '@etnos/types';

export interface ActivityRowProps {
	activity: StudentDashboardActivityInterface;
	relativeTime: string;
}

export const ActivityRow = ({ activity, relativeTime }: ActivityRowProps) => {
	const coverSrc =
		activity.coverUrl ??
		`/games/${activity.gameSlug}/cover/${activity.characterSlug}.jpg`;

	return (
		<div className="ui:flex ui:items-center ui:gap-2">
			<div className="ui:relative ui:w-10 ui:shrink-0 ui:overflow-hidden ui:rounded ui:bg-slate-100">
				<img
					src={coverSrc}
					alt={activity.gameSlug}
					className="ui:aspect-square ui:w-full ui:object-cover"
				/>
			</div>
			<div className="ui:min-w-0 ui:flex-1">
				<p className="ui:m-0 ui:text-sm ui:text-primary">
					{activity.description}{' '}
					<strong className="ui:font-black">{activity.highlight}</strong>
				</p>
				<p className="ui:m-0 ui:text-xs ui:text-slate-500">{relativeTime}</p>
			</div>
			<span className="ui:shrink-0 ui:text-sm ui:font-black ui:text-primary">
				+{activity.points}
			</span>
		</div>
	);
};
