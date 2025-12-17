import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/test/setup.tsx'],
		include: ['**/*.{test,spec}.{ts,tsx}'],
		coverage: {
			reporter: ['text', 'json', 'html', 'lcov'],
			exclude: ['**/node_modules/**', '**/dist/**', '**/index.ts'],
		},
	},
});
