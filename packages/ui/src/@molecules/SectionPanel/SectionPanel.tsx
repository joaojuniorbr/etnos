import { Card } from '@ui/@atoms';

export interface SectionPanelProps extends React.HTMLAttributes<HTMLElement> {
	title: string;
	action?: React.ReactNode;
}

export const SectionPanel = ({
	title,
	action,
	children,
	className,
	...props
}: SectionPanelProps) => (
	<Card className={`ui:p-0! ${className ?? ''}`} {...props}>
		<div className="ui:flex ui:items-center ui:justify-between ui:gap-2 ui:p-4 ui:border-b ui:border-slate-200">
			<h2 className="ui:m-0 ui:text-sm ui:font-bold ui:text-primary">
				{title}
			</h2>
			{action}
		</div>
		<div className="ui:p-4">{children}</div>
	</Card>
);
