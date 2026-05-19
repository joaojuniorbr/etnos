import React from 'react';

import type { StorybookConfig } from '@storybook/react-vite';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';

function getAbsolutePath(value: string): any {
	return path.dirname(
		fileURLToPath(import.meta.resolve(`${value}/package.json`)),
	);
}

const storybookDir = path.dirname(fileURLToPath(import.meta.url));
const uiSrc = path.resolve(storybookDir, '../../../packages/ui/src');

const toAliasArray = (
	alias: Record<string, string> | Array<{ find: string | RegExp; replacement: string }> | undefined,
) => {
	if (!alias) return [];
	if (Array.isArray(alias)) return alias;

	return Object.entries(alias).map(([find, replacement]) => ({
		find,
		replacement,
	}));
};

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
			alias: [
				{
					find: '@ui/',
					replacement: `${uiSrc}/`,
				},
				...toAliasArray(config.resolve?.alias),
				{
					find: '@etnos/tools',
					replacement: path.join(storybookDir, '__mocks__/etnos-tools.ts'),
				},
				{
					find: '@etnos/analytics/web',
					replacement: path.join(
						storybookDir,
						'__mocks__/etnos-analytics-web.ts',
					),
				},
				{
					find: 'next/image',
					replacement: path.join(
						storybookDir,
						'__mocks__/next-image.mock.tsx',
					),
				},
				{
					find: 'firebase/app',
					replacement: path.join(storybookDir, '__mocks__/firebaseApp.ts'),
				},
				{
					find: 'firebase/auth',
					replacement: path.join(storybookDir, '__mocks__/firebaseAuth.ts'),
				},
				{
					find: 'firebase/firestore',
					replacement: path.join(
						storybookDir,
						'__mocks__/firebaseFirestore.ts',
					),
				},
				{
					find: 'firebase/storage',
					replacement: path.join(
						storybookDir,
						'__mocks__/firebaseStorage.ts',
					),
				},
			],
		};
		return config;
	},
};
export default config;
