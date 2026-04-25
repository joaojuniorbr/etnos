import { View, type ViewProps } from 'react-native';
import { tw } from '@/utils';

export const SectionCard = ({
	children,
	style,
}: ViewProps & { children: React.ReactNode }) => (
	<View style={[tw`rounded border border-slate-200 bg-white p-6`, style]}>
		{children}
	</View>
);
