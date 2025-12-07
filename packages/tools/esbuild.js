const esbuild = require('esbuild');
const dotenv = require('dotenv');

dotenv.config();

// 💡 Solução: Use uma função async auto-executável (IIFE)
(async () => {
	try {
		await esbuild.build({
			// 💡 Usamos await aqui
			entryPoints: ['src/index.ts'],
			bundle: true,
			outfile: 'dist/index.js',
			platform: 'node',
			define: {
				// ... suas definições de variáveis de ambiente aqui ...
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
		});
	} catch (error) {
		console.error('ESBuild failed:', error);
		process.exit(1);
	}
})();
