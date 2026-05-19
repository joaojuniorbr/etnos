interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
	label: string;
	value: string | number;
	icon: React.ReactNode;
}

export const StatCard = ({
	label,
	value,
	icon,
	className,
	...props
}: StatCardProps) => {
	return (
		<div
			className={`ui:flex ui:gap-2 ui:items-center ui:rounded ui:p-2 ui:border-slate-200 ui:border ui:bg-white ui:md:p-4 ${className ?? ''}`}
			{...props}
		>
			<div className="ui:text-secondary ui:text-xl ui:p-2 ui:rounded ui:bg-secondary/10 ui:md:p-4">
				{icon}
			</div>
			<div className="ui:flex ui:flex-col">
				<p className="ui:text-xl ui:font-black ui:leading-tight ui:text-primary ui:md:text-2xl">
					{value}
				</p>
				<p className="ui:text-[8px] ui:font-bold ui:uppercase ui:text-slate-600 ui:md:text-xs">
					{label}
				</p>
			</div>
		</div>
	);
};
