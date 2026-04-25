import { Text, View } from 'react-native';
import { tw } from '@/utils';

export const StatCard = ({
	label,
	value,
	tone = 'dark',
}: {
	label: string;
	value: string | number;
	tone?: 'dark' | 'gold' | 'teal' | 'blue';
}) => {
	const styles = {
		dark: tw`bg-primary`,
		gold: tw`bg-secondary`,
		teal: tw`bg-accent`,
		blue: tw`bg-sky-700`,
	}[tone];

	const textColor = tone === 'gold' ? tw`text-primary` : tw`text-white`;

	return (
		<View style={[tw`flex-1 rounded p-4 gap-2`, styles]}>
			<Text style={[tw`text-xs uppercase leading-1`, textColor]}>{label}</Text>
			<Text style={[tw`text-xl font-black leading-1`, textColor]}>{value}</Text>
		</View>
	);
};
