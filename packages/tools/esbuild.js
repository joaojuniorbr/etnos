const esbuild = require('esbuild');
const dotenv = require('dotenv');

dotenv.config();

esbuild
	.build({
		entryPoints: ['src/index.ts'],
		bundle: true,
		outfile: 'dist/index.js',
		platform: 'node',
		define: {
			'process.env.NEXT_PUBLIC_FIREBASE_API_KEY': JSON.stringify(
				process.env.NEXT_PUBLIC_FIREBASE_API_KEY
			),
			'process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': JSON.stringify(
				process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
			),
			'process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify(
				process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
			),
			'process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': JSON.stringify(
				process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
			),
			'process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
				process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
			),
			'process.env.NEXT_PUBLIC_FIREBASE_APP_ID': JSON.stringify(
				process.env.NEXT_PUBLIC_FIREBASE_APP_ID
			),
			'process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': JSON.stringify(
				process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
			),
		},
	})
	.catch(() => process.exit(1));
