import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	transpilePackages: ['@etnos/ui', '@etnos/tools'],
	async rewrites() {
		return [
			{
				source: '/estudante/:path*',
				destination: `${process.env.STUDENT_URL}/estudante/:path*`,
			},
		];
	},
};

export default nextConfig;
