import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	// async rewrites() {
	// 	return [
	// 		{
	// 			source: '/admin/:path*',
	// 			destination: `${process.env.ADMIN_URL}/admin/:path*`,
	// 		},
	// 		{
	// 			source: '/estudante/:path*',
	// 			destination: `${process.env.STUDENT_URL}/estudante/:path*`,
	// 		},
	// 	];
	// },
};

export default nextConfig;
