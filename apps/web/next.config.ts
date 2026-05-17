import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import type { NextConfig } from 'next';

const appDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(appDir, '.env.local') });
dotenv.config({ path: path.join(appDir, '.env') });

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	transpilePackages: [
		'@etnos/analytics',
		'@etnos/ui',
		'@etnos/tools',
		'@etnos/types',
	],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
	},
	async rewrites() {
		const studentUrl =
			process.env.NEXT_PUBLIC_STUDENT_URL ?? 'https://etnos-student.vercel.app';

		const adminUrl =
			process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://etnos-admin.vercel.app';

		return [
			{
				source: '/estudante/:path*',
				destination: `${studentUrl}/:path*`,
			},
			{
				source: '/admin/:path*',
				destination: `${adminUrl}/:path*`,
			},
		];
	},
};

export default nextConfig;
