export const Card = ({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={`ui:border ui:border-slate-200 ui:p-4 ui:rounded ui:bg-white ui:md:p-6 ui:shadow ${className}`}
		{...props}
	>
		{children}
	</div>
);
