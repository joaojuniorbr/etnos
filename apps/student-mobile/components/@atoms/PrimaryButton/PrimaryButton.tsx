import {
	ActivityIndicator,
	Pressable,
	Text,
	type PressableProps,
} from 'react-native';
import { tw } from '@/utils';

const variantStyles = {
	primary: {
		container: tw`bg-primary`,
		text: tw`text-white`,
		spinner: tw.color('white'),
	},
	secondary: {
		container: tw`bg-secondary`,
		text: tw`text-primary`,
		spinner: tw.color('primary'),
	},
	ghost: {
		container: tw`bg-stone-100`,
		text: tw`text-primary`,
		spinner: tw.color('primary'),
	},
	danger: {
		container: tw`bg-red-600`,
		text: tw`text-white`,
		spinner: tw.color('white'),
	},
	outline: {
		container: tw`border border-primary`,
		text: tw`text-primary`,
		spinner: tw.color('primary'),
	},
	outlineDanger: {
		container: tw`border border-red-600`,
		text: tw`text-red-600`,
		spinner: tw.color('red-600'),
	},
};

type PrimaryButtonProps = PressableProps & {
	label: string;
	loading?: boolean;
	variant?: keyof typeof variantStyles;
};

export const PrimaryButton = ({
	disabled,
	label,
	loading,
	variant = 'primary',
	...props
}: PrimaryButtonProps) => {
	const isDisabled = disabled || loading;

	const variantStyle = variantStyles[variant];

	return (
		<Pressable
			accessibilityRole="button"
			disabled={isDisabled}
			style={({ pressed }) => [
				tw`items-center justify-center rounded p-4`,
				variantStyle.container,
				isDisabled ? tw`opacity-60` : null,
				pressed && !isDisabled ? tw`opacity-85` : null,
			]}
			{...props}
		>
			{loading ? (
				<ActivityIndicator color={variantStyle.spinner} />
			) : (
				<Text
					style={[tw`text-base font-extrabold uppercase`, variantStyle.text]}
				>
					{label}
				</Text>
			)}
		</Pressable>
	);
};
