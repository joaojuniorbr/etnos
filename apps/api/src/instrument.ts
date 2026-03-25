import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const isProduction = process.env.NODE_ENV === 'production';
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

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  enableLogs: true,
  tracesSampleRate: parseNumberEnv(
    process.env.SENTRY_TRACES_SAMPLE_RATE,
    isProduction ? 0.1 : 1.0,
  ),
  profileSessionSampleRate: parseNumberEnv(
    process.env.SENTRY_PROFILE_SESSION_SAMPLE_RATE,
    isProduction ? 0 : 1.0,
  ),
  profileLifecycle: 'trace',
  sendDefaultPii: parseBooleanEnv(
    process.env.SENTRY_SEND_DEFAULT_PII,
    !isProduction,
  ),
});
