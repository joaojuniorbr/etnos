import {
	Pressable,
	Text,
	TextInput,
	View,
	type TextInputProps,
} from 'react-native';
import { tw } from '@/utils';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';

type InputFieldProps = TextInputProps & {
	label: string;
	error?: string;
};

export const InputField = ({
	error,
	label,
	secureTextEntry,
	...props
}: InputFieldProps) => {
	const [hiddenPassword, setHiddenPassword] = useState(secureTextEntry);

	const togglePasswordVisibility = () => {
		setHiddenPassword(!hiddenPassword);
	};

	return (
		<View style={tw`gap-2`}>
			<Text style={tw`text-sm font-bold uppercase text-primary`}>{label}</Text>
			<View style={tw`relative`}>
				<TextInput
					placeholderTextColor={tw.color('slate-400')}
					style={tw`rounded border border-slate-300 bg-white p-4 text-base text-slate-900`}
					secureTextEntry={hiddenPassword}
					{...props}
				/>

				{secureTextEntry && (
					<Pressable
						style={tw`absolute right-4 top-5`}
						onPress={togglePasswordVisibility}
					>
						<FontAwesome
							name={hiddenPassword ? 'unlock' : 'lock'}
							size={16}
							color={tw.color('slate-400')}
						/>
					</Pressable>
				)}
			</View>
			{error ? <Text style={tw`text-sm text-red-600`}>{error}</Text> : null}
		</View>
	);
};
