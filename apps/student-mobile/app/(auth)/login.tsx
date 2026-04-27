import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { InputField, PrimaryButton, Screen, SectionCard } from '@/components';
import { useAuth } from '@/contexts';
import { tw } from '@/utils';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';

export default function LoginPage() {
	const { isLoading, signIn } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleLogin = async () => {
		try {
			await signIn(email.trim(), password);
			router.replace('/(app)');
		} catch {
			Toast.show({
				type: 'error',
				text1: 'Não foi possível entrar',
				text2: 'Confira seu e-mail e senha e tente novamente.',
			});
		}
	};

	return (
		<Screen contentContainerStyle={{ justifyContent: 'center' }}>
			<SectionCard style={tw`mx-auto w-full max-w-sm gap-4`}>
				<View style={[tw`mx-auto`]}>
					<Image
						source={require('@/assets/images/brand-horizontal.png')}
						style={tw`w-32 h-14`}
						contentFit="contain"
					/>
				</View>

				<InputField
					autoCapitalize="none"
					autoCorrect={false}
					keyboardType="email-address"
					label="E-mail"
					onChangeText={setEmail}
					placeholder="email@exemplo.com"
					value={email}
				/>
				<InputField
					label="Senha"
					onChangeText={setPassword}
					placeholder="Sua senha"
					secureTextEntry
					value={password}
				/>

				<PrimaryButton
					label="Entrar"
					loading={isLoading}
					onPress={handleLogin}
				/>

				<View style={tw`mt-4`}>
					<Text style={tw`text-center text-xs text-gray-400`}>
						Version 1.0.0
					</Text>
				</View>
			</SectionCard>
		</Screen>
	);
}
