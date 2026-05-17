import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import type { NextConfig } from 'next';

const appDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(appDir, '.env.local') });
dotenv.config({ path: path.join(appDir, '.env') });

const nextConfig: NextConfig = {
	transpilePackages: [
		'@etnos/analytics',
		'@etnos/ui',
		'@etnos/tools',
		'@etnos/types',
	],
	typescript: {
		ignoreBuildErrors: true,
	},
	assetPrefix: '/admin',
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
