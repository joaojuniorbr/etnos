import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = process.cwd();
const envFilePath = join(cwd, '.env.sonar');

const parseEnvFile = (contents) =>
	contents
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith('#'))
		.reduce((acc, line) => {
			const separatorIndex = line.indexOf('=');

			if (separatorIndex === -1) {
				return acc;
			}

			const key = line.slice(0, separatorIndex).trim();
			const rawValue = line.slice(separatorIndex + 1).trim();
			const value = rawValue.replace(/^["']|["']$/g, '');

			acc[key] = value;
			return acc;
		}, {});

const fileEnv = existsSync(envFilePath)
	? parseEnvFile(readFileSync(envFilePath, 'utf8'))
	: {};

const env = {
	...process.env,
	...fileEnv,
};

if (!env.SONAR_TOKEN) {
	console.error(
		'SONAR_TOKEN nao encontrado. Defina no ambiente ou em .env.sonar na raiz do projeto.',
	);
	process.exit(1);
}

const fixLcovPathsScript = join(
	fileURLToPath(new URL('.', import.meta.url)),
	'fix-lcov-paths.mjs',
);
const fixLcovResult = spawnSync(process.execPath, [fixLcovPathsScript], {
	cwd,
	stdio: 'inherit',
});

if (fixLcovResult.status !== 0) {
	process.exit(fixLcovResult.status ?? 1);
}

const scannerBin = join(cwd, 'node_modules', '.bin', 'sonar-scanner');
const child = spawn(scannerBin, [], {
	stdio: 'inherit',
	env,
});

child.on('exit', (code) => {
	process.exit(code ?? 1);
});
