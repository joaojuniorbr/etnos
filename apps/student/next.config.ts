import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
