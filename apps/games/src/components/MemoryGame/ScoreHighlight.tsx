import { ReactNode } from 'react';

interface ScoreHighlightProps extends React.HTMLAttributes<HTMLDListElement> {
	icon: ReactNode;
	label: string;
	score?: ReactNode;
	className?: string;
}

export const ScoreHighlight = ({
	icon,
	label,
	score,
	className = '',
	...props
}: ScoreHighlightProps) => {
	return (
		<dl
			className={`w-full flex flex-col text-center gap-1 sm:text-left sm:flex-row sm:gap-4 items-center py-2 px-4 rounded border ${className}`}
			{...props}
		>
			<dt className='text-3xl'>{icon}</dt>
			<dd>
				<p className='text-xs uppercase m-0'>{label}</p>
				<span className='text-xl font-bold'>{score}</span>
			</dd>
		</dl>
	);
};
