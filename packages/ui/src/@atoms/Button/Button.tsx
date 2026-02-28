import { Button as ButtonAnt, ButtonProps } from 'antd';

interface EtnosButtonProps extends Omit<ButtonProps, 'type' | 'size'> {
	type?: ButtonProps['type'] | 'secondary';
	size?: ButtonProps['size'] | 'xl';
}

export const Button = ({
	type,
	size,
	className,
	...props
}: EtnosButtonProps) => {
	const isSecondary = type === 'secondary';

	const isXl = size === 'xl';

	const secondaryClasses = isSecondary
		? 'ui:bg-secondary! ui:text-primary! ui:font-bold!'
		: '';

	const xlClasses = isXl
		? 'ui:px-10! ui:py-6! ui:text-base! ui:md:text-xl! ui:md:px-12! ui:md:py-8!'
		: '';

	const classes = [secondaryClasses, xlClasses, className]
		.filter(Boolean)
		.join(' ');

	return (
		<ButtonAnt
			{...props}
			size={isXl ? 'large' : size}
			type={isSecondary ? 'default' : type}
			className={classes}
		/>
	);
};
