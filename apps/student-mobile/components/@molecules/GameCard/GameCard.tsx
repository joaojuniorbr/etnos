import { Pressable, Text, View } from 'react-native';
import type { GameInterface } from '@etnos/types';
import { tw } from '@/utils';

export const GameCard = ({
	game,
	onPress,
}: {
	game: GameInterface;
	onPress: () => void;
}) => (
	<Pressable
		onPress={onPress}
		style={({ pressed }) => [
			tw`mb-4 rounded border border-stone-200 bg-white p-5`,
			pressed ? tw`opacity-90` : null,
		]}
	>
		<View style={tw`mb-4 rounded bg-secondary px-3 py-2 self-start`}>
			<Text style={tw`text-xs font-black uppercase text-primary`}>
				Jogo liberado
			</Text>
		</View>
		<Text style={tw`text-2xl font-black text-primary`}>{game.name}</Text>
		<Text style={tw`mt-3 text-base leading-6 text-stone-700`}>
			{game.description}
		</Text>
		<Text style={tw`mt-5 text-sm font-black uppercase text-accent`}>
			Abrir desafio
		</Text>
	</Pressable>
);
