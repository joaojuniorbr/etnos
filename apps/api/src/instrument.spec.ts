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
      tracesSampleRate: 1.0,
      profileSessionSampleRate: 1.0,
      profileLifecycle: 'trace',
      sendDefaultPii: true,
    });
  });
});
