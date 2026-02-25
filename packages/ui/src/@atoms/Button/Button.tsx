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
		? 'ui:px-10! ui:py-6! ui:text-md! ui:md:text-xl! md:ui:px-12! md:ui:py-8! '
		: '';

	return (
		<ButtonAnt
			{...props}
			size={isXl ? 'large' : size}
			type={isSecondary ? 'default' : type}
			className={`${secondaryClasses} ${xlClasses} ${className || ''}`}
		/>
	);
};
