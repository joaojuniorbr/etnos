import fs from 'fs';

if (process.env.EXPO_PUBLIC_GOOGLE_SERVICE) {
	fs.writeFileSync(
		'./google-services.json',
		process.env.EXPO_PUBLIC_GOOGLE_SERVICE,
	);
}

export default {
	expo: {
		name: 'Etnos',
		slug: 'etnos-student-mobile',
		scheme: 'etnos-student-mobile',
		orientation: 'portrait',
		icon: './assets/images/icon.png',
		userInterfaceStyle: 'automatic',
		splash: {
			image: './assets/images/splash-icon.png',
			resizeMode: 'contain',
			backgroundColor: '#ffffff',
		},
		ios: {
			supportsTablet: true,
		},
		android: {
			googleServicesFile: './google-services.json',
			adaptiveIcon: {
				foregroundImage: './assets/images/adaptive-icon.png',
				backgroundColor: '#ffffff',
			},
			softwareKeyboardLayoutMode: 'resize',
			package: 'com.joaojunior.etnosstudentmobile',
		},
		web: {
			favicon: './assets/images/favicon.png',
		},
		experiments: {
			typedRoutes: true,
			autolinkingModuleResolution: true,
		},
		plugins: [
			'expo-router',
			[
				'expo-notifications',
				{
					icon: './assets/images/icon.png',
					color: '#ffffff',
					sounds: [],
				},
			],
		],
		extra: {
			router: {},
			eas: {
				projectId: '5fd7137a-f828-488c-9520-3fcd2483b9cf',
			},
		},
		owner: 'joaojunior',
		runtimeVersion: {
			policy: 'appVersion',
		},
		updates: {
			url: 'https://u.expo.dev/5fd7137a-f828-488c-9520-3fcd2483b9cf',
		},
	},
};
