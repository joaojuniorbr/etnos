import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import type { CharacterInterface } from '@etnos/types';
import { FontAwesome } from '@expo/vector-icons';
import { tw } from '@/utils';

type CharacterCardProps = {
	character: CharacterInterface;
	selected?: boolean;
	onPress?: () => void;
};

export const CharacterCard = ({
	character,
	onPress,
	selected,
}: CharacterCardProps) => (
	<Pressable
		onPress={onPress}
		style={({ pressed }) => [
			tw`overflow-hidden rounded border bg-white relative`,
			selected ? tw`border-secondary` : tw`border-slate-200`,
			pressed ? tw`opacity-90` : null,
		]}
	>
		{character.imageUrl ? (
			<Image
				source={{ uri: character.imageUrl }}
				contentFit="cover"
				style={tw`aspect-square w-full`}
			/>
		) : (
			<View
				style={tw`aspect-square w-full items-center justify-center bg-stone-200`}
			>
				<Text style={tw`text-lg font-black text-primary`}>
					{character.name}
				</Text>
			</View>
		)}
		{selected ? (
			<View style={tw`rounded-full bg-secondary p-1 absolute top-1 right-1`}>
				<FontAwesome name="check" size={14} color={tw.color('white')} />
			</View>
		) : null}

		<View style={tw`p-4 border-t border-slate-200`}>
			<Text style={tw`text-xs font-black text-primary text-center`}>
				{character.name}
			</Text>
		</View>
	</Pressable>
);
