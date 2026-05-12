import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(currentDir, '..');
const envPath = resolve(packageDir, '.env');

if (existsSync(envPath)) {
	loadEnv({ path: envPath });
}

const args = process.argv.slice(2);
const grafanaIndex = args.indexOf('--grafana');
const useGrafana = grafanaIndex >= 0;

if (useGrafana) {
	args.splice(grafanaIndex, 1);
}

const k6Args = ['run'];

if (useGrafana) {
	process.env.K6_PROMETHEUS_RW_SERVER_URL ??=
		'http://localhost:9090/api/v1/write';
	process.env.K6_PROMETHEUS_RW_TREND_STATS ??= 'p(95),avg,min,max';
	k6Args.push('-o', 'experimental-prometheus-rw');
}

k6Args.push(...args);

const result = spawnSync('k6', k6Args, {
	cwd: packageDir,
	env: process.env,
	stdio: 'inherit',
});

if (result.error) {
	console.error(result.error.message);
	process.exit(1);
}

process.exit(result.status ?? 1);
