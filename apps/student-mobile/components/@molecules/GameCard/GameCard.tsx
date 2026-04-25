import { Pressable, Text, View } from 'react-native';
import { GameInterface } from '@etnos/types';
import { tw } from '@/utils';
import { Image } from 'expo-image';

interface GameCardProps {
	game: GameInterface;
	character: string;
	onPress: () => void;
}

export const GameCard = ({ character, game, onPress }: GameCardProps) => (
	<Pressable
		onPress={onPress}
		style={({ pressed }) => [
			tw`mb-4 rounded border border-stone-200 bg-white overflow-hidden`,
			pressed ? tw`opacity-90` : null,
		]}
	>
		<Image
			source={{
				uri: `https://etnos.online/games/${game.slug}/cover/${character}.jpg`,
			}}
			contentFit="cover"
			style={tw`aspect-square w-full`}
		/>
		<View style={tw`p-6 gap-2`}>
			<Text style={tw`text-lg font-black text-primary`}>{game.name}</Text>
			<Text style={tw`text-xs `}>{game.description}</Text>
			<Text
				style={tw`text-sm font-black uppercase text-primary underline mt-2`}
			>
				Abrir desafio
			</Text>
		</View>
	</Pressable>
);
