import type { NextConfig } from 'next';
import dotenv from 'dotenv';

dotenv.config();

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	transpilePackages: ['@etnos/ui', '@etnos/tools'],
	async rewrites() {
		const studentUrl =
			process.env.NEXT_PUBLIC_STUDENT_URL ?? 'https://etnos.vercel.app:3002';

		if (!studentUrl) {
			return [];
		}

		return [
			{
				source: '/estudante/:path*',
				destination: `${studentUrl}/estudante/:path*`,
			},
		];
	},
};

export default nextConfig;
