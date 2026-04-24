import { ActivityIndicator, Text, View } from 'react-native';
import { tw } from '@/utils';

export const LoadingState = ({ label = 'Carregando...' }: { label?: string }) => (
	<View style={tw`flex-1 items-center justify-center px-8`}>
		<ActivityIndicator color="#371f12" size="large" />
		<Text style={tw`mt-4 text-center text-base text-stone-600`}>{label}</Text>
	</View>
);
