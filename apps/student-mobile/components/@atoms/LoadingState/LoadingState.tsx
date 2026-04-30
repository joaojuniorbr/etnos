import { ActivityIndicator, Text, View, ViewProps } from 'react-native';
import { tw } from '@/utils';

interface LoadingStateProps extends ViewProps {
	label?: string;
	isLoading?: boolean;
}

export const LoadingState = ({
	label = 'Carregando...',
	isLoading = false,
	...props
}: LoadingStateProps) =>
	Boolean(props.children) ? (
		<View style={tw`relative`} {...props}>
			{isLoading && (
				<View
					style={tw`absolute top-0 left-0 right-0 bottom-0 justify-center items-center z-10 bg-white/80`}
				>
					<ActivityIndicator color={tw.color('primary')} size="large" />
				</View>
			)}

			{props.children}
		</View>
	) : (
		<View style={tw`flex-1 items-center justify-center px-8`} {...props}>
			<ActivityIndicator color={tw.color('primary')} size="large" />
			<Text style={tw`mt-4 text-center text-base text-stone-600`}>{label}</Text>
		</View>
	);
