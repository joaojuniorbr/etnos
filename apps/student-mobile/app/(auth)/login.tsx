import { useState } from 'react';
import { router } from 'expo-router';
import { Modal, Pressable, Text, View } from 'react-native';
import { InputField, PrimaryButton, Screen, SectionCard } from '@/components';
import { useAuth } from '@/contexts';
import { tw } from '@/utils';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';

export default function LoginPage() {
	const { isLoading, recoverPassword, signIn } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [recoveryEmail, setRecoveryEmail] = useState('');
	const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

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

	const openRecovery = () => {
		setRecoveryEmail(email.trim());
		setIsRecoveryOpen(true);
	};

	const closeRecovery = () => {
		if (isLoading) {
			return;
		}

		setIsRecoveryOpen(false);
	};

	const handleRecovery = async () => {
		const normalizedEmail = recoveryEmail.trim();

		if (!normalizedEmail) {
			Toast.show({
				type: 'error',
				text1: 'Informe seu e-mail',
				text2: 'Digite o e-mail cadastrado para recuperar a senha.',
			});
			return;
		}

		try {
			await recoverPassword(normalizedEmail);
			Toast.show({
				type: 'success',
				text1: 'E-mail enviado',
				text2: 'Verifique sua caixa de entrada e spam.',
			});
			setIsRecoveryOpen(false);
			setRecoveryEmail('');
		} catch {
			Toast.show({
				type: 'error',
				text1: 'Não foi possível enviar',
				text2: 'Tente novamente em alguns instantes.',
			});
		}
	};

	return (
		<>
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

					<Pressable
						accessibilityRole="button"
						style={tw`self-end py-1`}
						onPress={openRecovery}
					>
						<Text
							style={tw`text-xs font-black uppercase text-primary underline`}
						>
							Esqueci minha senha
						</Text>
					</Pressable>

					<PrimaryButton
						label="Entrar"
						loading={isLoading}
						onPress={handleLogin}
					/>
				</SectionCard>
			</Screen>

			<Modal
				animationType="fade"
				onRequestClose={closeRecovery}
				transparent
				visible={isRecoveryOpen}
			>
				<View style={tw`flex-1 justify-center bg-black/40 px-4`}>
					<SectionCard style={tw`gap-4`}>
						<View>
							<Text style={tw`text-xl font-black uppercase text-primary`}>
								Recuperar senha
							</Text>
							<Text style={tw`mt-2 text-base text-stone-600`}>
								Insira o e-mail cadastrado. Se a mensagem não chegar, verifique
								sua caixa de spam.
							</Text>
						</View>

						<InputField
							autoCapitalize="none"
							autoCorrect={false}
							keyboardType="email-address"
							label="E-mail"
							onChangeText={setRecoveryEmail}
							placeholder="email@exemplo.com"
							value={recoveryEmail}
						/>

						<PrimaryButton
							label="Enviar"
							loading={isLoading}
							onPress={() => void handleRecovery()}
							variant="secondary"
						/>
						<PrimaryButton
							label="Cancelar"
							disabled={isLoading}
							onPress={closeRecovery}
							variant="ghost"
						/>
					</SectionCard>
				</View>
			</Modal>
		</>
	);
}
