import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		include: ['src/**/*.{test,spec}.ts'],
		coverage: {
			reporter: ['text', 'json', 'html', 'lcov'],
			include: ['src/**/*.ts'],
			exclude: ['src/**/index.ts', 'src/**/*.d.ts', 'src/**/types.ts'],
		},
	},
});
