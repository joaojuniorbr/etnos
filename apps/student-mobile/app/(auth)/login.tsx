import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { InputField, PrimaryButton, Screen, SectionCard } from '@/components';
import { useAuth } from '@/contexts';
import { tw } from '@/utils';
import { Image } from 'expo-image';

export default function LoginPage() {
	const { isLoading, signIn } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleLogin = async () => {
		try {
			await signIn(email.trim(), password);
			router.replace('/(app)');
		} catch {
			Alert.alert(
				'Não foi possível entrar',
				'Confira seu e-mail e senha e tente novamente.',
			);
		}
	};

	return (
		<Screen contentContainerStyle={{ justifyContent: 'center' }}>
			<SectionCard style={tw`mx-auto mb-4 w-full max-w-sm gap-4`}>
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
			</SectionCard>
		</Screen>
	);
}
