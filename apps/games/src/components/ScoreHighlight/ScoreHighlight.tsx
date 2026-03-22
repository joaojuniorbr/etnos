interface ScoreHighlightProps extends React.HTMLAttributes<HTMLDListElement> {
	icon: React.ReactNode;
	label: string;
	score?: React.ReactNode;
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
			className={`w-full flex flex-row items-center justify-center rounded-full gap-1 p-2 md:gap-2 md:py-2 md:px-4 ${className} shadow-md`}
			{...props}
		>
			<dt className='text-base md:text-3xl'>{icon}</dt>
			<dd>
				<div className='font-bold md:font-black md:text-xl md:leading-6'>
					{score}
				</div>
				<div className='text-[8px] uppercase m-0 leading-1 hidden md:block'>
					{label}
				</div>
			</dd>
		</dl>
	);
};
