describe('instrument', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('deve inicializar o Sentry com a configuracao esperada', async () => {
    const init = jest.fn();
    const integration = { name: 'profiling' };
    const nodeProfilingIntegration = jest.fn(() => integration);

    process.env.SENTRY_DSN = 'https://dsn.example';
    process.env.NODE_ENV = 'test';

    jest.doMock('@sentry/nestjs', () => ({
      init,
    }));

    jest.doMock('@sentry/profiling-node', () => ({
      nodeProfilingIntegration,
    }));

    await import('./instrument');

    expect(nodeProfilingIntegration).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledWith({
      dsn: 'https://dsn.example',
      integrations: [integration],
      enableLogs: true,
      tracesSampleRate: 1,
      profileSessionSampleRate: 1,
      profileLifecycle: 'trace',
      sendDefaultPii: false,
    });
  });

  it('deve usar fallbacks iguais em qualquer ambiente e respeitar boolean env falso', async () => {
    const init = jest.fn();
    const integration = { name: 'profiling' };
    const nodeProfilingIntegration = jest.fn(() => integration);

    process.env.SENTRY_DSN = 'https://dsn.example';
    process.env.NODE_ENV = 'production';
    process.env.SENTRY_TRACES_SAMPLE_RATE = 'invalid';
    process.env.SENTRY_PROFILE_SESSION_SAMPLE_RATE = 'invalid';
    process.env.SENTRY_SEND_DEFAULT_PII = 'false';

    jest.doMock('@sentry/nestjs', () => ({
      init,
    }));

    jest.doMock('@sentry/profiling-node', () => ({
      nodeProfilingIntegration,
    }));

    await import('./instrument');

    expect(init).toHaveBeenCalledWith({
      dsn: 'https://dsn.example',
      integrations: [integration],
      enableLogs: true,
      tracesSampleRate: 1,
      profileSessionSampleRate: 1,
      profileLifecycle: 'trace',
      sendDefaultPii: false,
    });
  });

  it('deve respeitar sample rates válidos informados por ambiente', async () => {
    const init = jest.fn();
    const integration = { name: 'profiling' };
    const nodeProfilingIntegration = jest.fn(() => integration);

    process.env.SENTRY_DSN = 'https://dsn.example';
    process.env.NODE_ENV = 'production';
    process.env.SENTRY_TRACES_SAMPLE_RATE = '0.5';
    process.env.SENTRY_PROFILE_SESSION_SAMPLE_RATE = '0.25';

    jest.doMock('@sentry/nestjs', () => ({
      init,
    }));

    jest.doMock('@sentry/profiling-node', () => ({
      nodeProfilingIntegration,
    }));

    await import('./instrument');

    expect(init).toHaveBeenCalledWith({
      dsn: 'https://dsn.example',
      integrations: [integration],
      enableLogs: true,
      tracesSampleRate: 0.5,
      profileSessionSampleRate: 0.25,
      profileLifecycle: 'trace',
      sendDefaultPii: false,
    });
  });

  it('deve usar fallback para sendDefaultPii quando env não estiver definida', async () => {
    const init = jest.fn();
    const integration = { name: 'profiling' };
    const nodeProfilingIntegration = jest.fn(() => integration);

    process.env.SENTRY_DSN = 'https://dsn.example';
    delete process.env.SENTRY_SEND_DEFAULT_PII;

    jest.doMock('node:fs', () => ({
      existsSync: jest.fn(() => false),
    }));

    jest.doMock('@sentry/nestjs', () => ({
      init,
    }));

    jest.doMock('@sentry/profiling-node', () => ({
      nodeProfilingIntegration,
    }));

    await import('./instrument');

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        sendDefaultPii: false,
      }),
    );
  });
});
