import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import type { CharacterInterface } from '@etnos/types';
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
			tw`mb-4 overflow-hidden rounded-3xl border bg-white`,
			selected ? tw`border-primary` : tw`border-stone-200`,
			pressed ? tw`opacity-90` : null,
		]}
	>
		{character.imageUrl ? (
			<Image
				source={{ uri: character.imageUrl }}
				contentFit="cover"
				style={tw`h-48 w-full bg-stone-100`}
			/>
		) : (
			<View style={tw`h-48 w-full items-center justify-center bg-stone-200`}>
				<Text style={tw`text-lg font-black text-primary`}>
					{character.name}
				</Text>
			</View>
		)}
		<View style={tw`p-4`}>
			<View style={tw`flex-row items-center justify-between`}>
				<Text style={tw`text-xl font-black text-primary`}>{character.name}</Text>
				{selected ? (
					<View style={tw`rounded-full bg-secondary px-3 py-1`}>
						<Text style={tw`text-xs font-black uppercase text-primary`}>
							Selecionado
						</Text>
					</View>
				) : null}
			</View>
			<Text style={tw`mt-2 text-xs font-bold uppercase text-stone-500`}>
				{character.region}
			</Text>
			<Text style={tw`mt-3 text-sm leading-6 text-stone-700`}>
				{character.description}
			</Text>
		</View>
	</Pressable>
);
