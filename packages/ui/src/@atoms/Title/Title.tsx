export const Title = ({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
	<div
		{...props}
		className={`ui:text-xl ui:font-black ui:uppercase ui:text-primary ${className}`}
	>
		{children}
	</div>
);
