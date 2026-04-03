import React from 'react';

import type { StorybookConfig } from '@storybook/react-vite';

import { dirname } from 'path';

import { fileURLToPath } from 'url';

import tailwindcss from '@tailwindcss/vite';

function getAbsolutePath(value: string): any {
	return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
	stories: [
		'../stories/**/*.mdx',
		'../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
		'../../../apps/games/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
		'../../../packages/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
	],
	staticDirs: ['../../web/public'],
	addons: [
		getAbsolutePath('@chromatic-com/storybook'),
		getAbsolutePath('@storybook/addon-docs'),
		getAbsolutePath('@storybook/addon-a11y'),
		getAbsolutePath('@storybook/addon-vitest'),
	],
	framework: {
		name: getAbsolutePath('@storybook/react-vite'),
		options: {},
	},
	viteFinal: async (config) => {
		config.define = {
			...config.define,
			process: {
				env: {
					NEXT_PUBLIC_FIREBASE_API_KEY:
						process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
					NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
						process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
					NEXT_PUBLIC_FIREBASE_PROJECT_ID:
						process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
					NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
						process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
					NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
						process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
					NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
					NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
						process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
					NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
				},
			},
		};
		config.plugins = [...(config.plugins ?? []), tailwindcss()];
		config.resolve = {
			...config.resolve,
			alias: {
				...config.resolve?.alias,
				'next/image': fileURLToPath(
					new URL('./__mocks__/next-image.mock.tsx', import.meta.url),
				),
				'firebase/app': fileURLToPath(
					new URL('./__mocks__/firebaseApp.ts', import.meta.url),
				),
				'firebase/auth': fileURLToPath(
					new URL('./__mocks__/firebaseAuth.ts', import.meta.url),
				),
				'firebase/firestore': fileURLToPath(
					new URL('./__mocks__/firebaseFirestore.ts', import.meta.url),
				),
				'firebase/storage': fileURLToPath(
					new URL('./__mocks__/firebaseStorage.ts', import.meta.url),
				),
			},
		};
		return config;
	},
};
export default config;
