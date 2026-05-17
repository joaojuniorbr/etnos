import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const cwd = process.cwd();
const roots = ['packages', 'apps'];

const prefixLcovSourcePaths = (contents, prefix) =>
	contents.replace(/^SF:(.+)$/gm, (line, sourcePath) => {
		if (
			sourcePath.startsWith(`${prefix}/`) ||
			sourcePath.startsWith('packages/') ||
			sourcePath.startsWith('apps/')
		) {
			return line;
		}

		return `SF:${prefix}/${sourcePath}`;
	});

for (const root of roots) {
	const rootDir = join(cwd, root);

	if (!existsSync(rootDir)) {
		continue;
	}

	for (const name of readdirSync(rootDir, { withFileTypes: true })) {
		if (!name.isDirectory()) {
			continue;
		}

		const lcovPath = join(rootDir, name.name, 'coverage', 'lcov.info');

		if (!existsSync(lcovPath)) {
			continue;
		}

		const prefix = `${root}/${name.name}`;
		const original = readFileSync(lcovPath, 'utf8');
		const fixed = prefixLcovSourcePaths(original, prefix);

		if (fixed !== original) {
			writeFileSync(lcovPath, fixed);
			console.log(`Ajustados caminhos em ${lcovPath}`);
		}
	}
}
