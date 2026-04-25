import { Redirect, Tabs } from 'expo-router';
import { LoadingState } from '@/components';
import { useAuth } from '@/contexts';
import { View } from 'react-native';

import { FontAwesome } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { tw } from '@/utils';

interface IconProps extends ComponentProps<typeof FontAwesome> {
	focused: boolean;
}

const colorActive = tw.color('amber-600');

const Icon = (props: IconProps) => (
	<View
		style={[
			tw`flex items-center justify-center w-8 h-8 rounded`,
			props.focused && {
				backgroundColor: colorActive,
			},
		]}
	>
		<FontAwesome
			name={props.name}
			size={props.focused ? 18 : 24}
			color={props.focused ? tw.color('white') : props.color}
		/>
	</View>
);

export default function AppLayout() {
	const { isAuthenticated, isHydrated } = useAuth();

	if (!isHydrated) {
		return <LoadingState label="Carregando a área do estudante..." />;
	}

	if (!isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: colorActive,
				tabBarInactiveTintColor: tw.color('stone-600'),
				tabBarHideOnKeyboard: true,
				tabBarStyle: {
					backgroundColor: tw.color('white'),
					borderTopColor: tw.color('slate-200'),
					paddingTop: 10,
					height: 72,
				},
				tabBarLabelStyle: {
					fontSize: 8,
					fontWeight: '800',
					textTransform: 'uppercase',
					paddingTop: 6,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Início',
					tabBarIcon: (props) => <Icon name="home" focused={props.focused} />,
				}}
			/>
			<Tabs.Screen
				name="characters"
				options={{
					title: 'Personagem',
					tabBarIcon: (props) => <Icon name="star" focused={props.focused} />,
				}}
			/>
			<Tabs.Screen
				name="games"
				options={{
					title: 'Jogos',
					tabBarIcon: (props) => (
						<Icon name="gamepad" focused={props.focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Perfil',
					tabBarIcon: (props) => <Icon name="user" focused={props.focused} />,
				}}
			/>
		</Tabs>
	);
}
