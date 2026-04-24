import { useEffect } from 'react';
import {
	Nunito_400Regular,
	Nunito_600SemiBold,
	Nunito_700Bold,
	Nunito_800ExtraBold,
	Nunito_200ExtraLight,
	Nunito_300Light,
} from '@expo-google-fonts/nunito';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDeviceContext } from 'twrnc';
import { useState } from 'react';

import { AppProviders } from '@/providers';
import { tw } from '@/utils';

export default function RootLayout() {
	useDeviceContext(tw, {
		initialColorScheme: 'light',
		observeDeviceColorSchemeChanges: false,
	});

	const [fontsLoaded, setFontsLoaded] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const loadFonts = async () => {
			await Font.loadAsync({
				Nunito_200ExtraLight,
				Nunito_300Light,
				Nunito_400Regular,
				Nunito_600SemiBold,
				Nunito_700Bold,
				Nunito_800ExtraBold,
			});

			if (isMounted) {
				setFontsLoaded(true);
			}
		};

		void loadFonts();

		return () => {
			isMounted = false;
		};
	}, []);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<AppProviders>
					<StatusBar style="dark" />
					<Stack
						screenOptions={{
							headerShown: false,
							contentStyle: {
								backgroundColor: tw.color('white'),
							},
						}}
					>
						<Stack.Screen name="index" />
						<Stack.Screen name="(auth)" />
						<Stack.Screen name="(app)" />
						<Stack.Screen
							name="games/memory"
							options={{
								headerShown: true,
								title: 'Jogo da Memória',
								headerTintColor: tw.color('primary'),
								headerStyle: {
									backgroundColor: tw.color('white'),
								},
							}}
						/>
					</Stack>
				</AppProviders>
				<Toast />
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
