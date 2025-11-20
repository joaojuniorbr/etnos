import type { StorybookConfig } from '@storybook/react-vite';

import { dirname } from 'path';

import { fileURLToPath } from 'url';

import tailwindcss from '@tailwindcss/vite';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
	return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
	stories: [
		'../stories/**/*.mdx',
		'../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
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
				},
			},
		};
		config.plugins = [...(config.plugins ?? []), tailwindcss()];
		config.resolve = {
			...config.resolve,
			alias: {
				...config.resolve?.alias,
				'next/image': fileURLToPath(
					new URL('./next-image.mock.tsx', import.meta.url)
				),
			},
		};
		return config;
	},
};
export default config;
