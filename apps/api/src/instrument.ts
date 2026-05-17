import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { isSentryEnabled } from './sentry/sentry.config';

const envFiles = [
	resolve(process.cwd(), '.env'),
	resolve(process.cwd(), 'apps/api/.env'),
];

envFiles.filter(existsSync).forEach((path) => {
	loadEnv({ path, quiet: true });
});

const parseNumberEnv = (
	value: string | undefined,
	fallback: number,
): number => {
	const parsed = Number.parseFloat(value ?? '');
	return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBooleanEnv = (
	value: string | undefined,
	fallback: boolean,
): boolean => {
	if (value === undefined) {
		return fallback;
	}

	return value === 'true';
};

if (isSentryEnabled()) {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		integrations: [nodeProfilingIntegration()],
		enableLogs: true,
		tracesSampleRate: parseNumberEnv(process.env.SENTRY_TRACES_SAMPLE_RATE, 1),
		profileSessionSampleRate: parseNumberEnv(
			process.env.SENTRY_PROFILE_SESSION_SAMPLE_RATE,
			1,
		),
		profileLifecycle: 'trace',
		sendDefaultPii: parseBooleanEnv(process.env.SENTRY_SEND_DEFAULT_PII, false),
	});
}
