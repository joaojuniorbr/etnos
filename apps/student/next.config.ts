import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	transpilePackages: ['@etnos/ui', '@etnos/tools'],
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	basePath: '/estudante',
	assetPrefix: '/estudante',
};

export default nextConfig;
