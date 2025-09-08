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
			process.env.NEXT_PUBLIC_STUDENT_URL ?? 'https://etnos-student.vercel.app';

		return [
			{
				source: '/estudante/:path*',
				destination: `${studentUrl}/:path*`,
			},
		];
	},
};

export default nextConfig;
