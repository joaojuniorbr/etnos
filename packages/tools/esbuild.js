import * as esbuild from 'esbuild';
import * as dotenv from 'dotenv';

dotenv.config();

try {
	await esbuild.build({
		entryPoints: ['src/index.ts'],
		bundle: true,
		outfile: 'dist/index.js',
		platform: 'node',
	});
} catch (error) {
	console.error('ESBuild failed:', error);
	process.exit(1);
}
