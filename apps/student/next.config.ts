import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	transpilePackages: [
		'@etnos/core',
		'@etnos/ui',
		'@etnos/tools',
		'@etnos/games',
		'@etnos/types',
	],
	typescript: {
		ignoreBuildErrors: true,
	},
	assetPrefix: '/estudante',
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
	},
};

export default nextConfig;
