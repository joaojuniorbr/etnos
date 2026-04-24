import {
	ActivityIndicator,
	Pressable,
	Text,
	type PressableProps,
} from 'react-native';
import { tw } from '@/utils';

type PrimaryButtonProps = PressableProps & {
	label: string;
	loading?: boolean;
	variant?: 'primary' | 'secondary' | 'ghost';
};

export const PrimaryButton = ({
	disabled,
	label,
	loading,
	variant = 'primary',
	...props
}: PrimaryButtonProps) => {
	const isDisabled = disabled || loading;

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
	}[variant];

	return (
		<Pressable
			accessibilityRole="button"
			disabled={isDisabled}
			style={({ pressed }) => [
				tw`items-center justify-center rounded p-4`,
				variantStyles.container,
				isDisabled ? tw`opacity-60` : null,
				pressed && !isDisabled ? tw`opacity-85` : null,
			]}
			{...props}
		>
			{loading ? (
				<ActivityIndicator color={variantStyles.spinner} />
			) : (
				<Text
					style={[tw`text-base font-extrabold uppercase`, variantStyles.text]}
				>
					{label}
				</Text>
			)}
		</Pressable>
	);
};
