import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { PrimaryButton, Screen, SectionCard } from '@/components';
import { useAuth } from '@/contexts';
import { tw } from '@/utils';
import { Image } from 'expo-image';

export default function HomePage() {
	const { user } = useAuth();

	return (
		<Screen>
			<View style={tw`gap-4`}>
				<SectionCard style={tw`gap-2 p-6`}>
					<Image
						source={require('@/assets/images/persona-group.jpg')}
						style={tw`w-full h-30`}
						contentFit="contain"
						contentPosition="center"
					/>

					<Text style={tw`text-lg font-black text-center text-primary`}>
						Oi, {user?.childName || 'Área do estudante'}, bem-vindo ao Etnos!
					</Text>
					<Text style={tw`text-xs text-center text-black`}>
						Aqui, cada jogo é uma viagem pela cultura brasileira. Escolha um
						personagem e comece aprendendo de um jeito leve e divertido.
					</Text>
				</SectionCard>

				<SectionCard>
					<Text style={tw`text-lg font-black text-primary uppercase`}>
						Como funciona
					</Text>
					<Text style={tw`text-base`}>1. Escolha seu guia cultural.</Text>
					<Text style={tw`text-base`}>
						2. Entre em um jogo habilitado pela sua escola.
					</Text>
					<Text style={tw`text-base`}>
						3. Salve seus pontos e acompanhe seu progresso no perfil.
					</Text>
				</SectionCard>

				<PrimaryButton
					label="Escolher personagem"
					onPress={() => router.push('/(app)/characters')}
				/>
			</View>
		</Screen>
	);
}
