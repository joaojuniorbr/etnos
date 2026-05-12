import { HttpException, HttpStatus } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { lastValueFrom, of, throwError } from 'rxjs';
import { MetricsInterceptor } from './metrics.interceptor';

jest.mock('@sentry/nestjs', () => ({
  getActiveSpan: jest.fn(),
  logger: {
    warn: jest.fn(),
  },
}));

describe('MetricsInterceptor', () => {
  const metricsService = {
    observeHttpRequest: jest.fn(),
  };

  const createHttpContext = (requestOverrides = {}, responseOverrides = {}) =>
    ({
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          originalUrl: '/api/public/schools',
          path: '/api/public/schools',
          headers: {},
          route: { path: '/public/schools' },
          ...requestOverrides,
        }),
        getResponse: () => ({
          statusCode: 200,
          ...responseOverrides,
        }),
      }),
    } as any);

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.SENTRY_LOAD_TEST_ANOMALY_LOGS;
  });

  it('ignora contextos que não são HTTP', async () => {
    const interceptor = new MetricsInterceptor(metricsService as any);
    const context = { getType: () => 'rpc' } as any;

    await expect(
      lastValueFrom(interceptor.intercept(context, { handle: () => of('ok') })),
    ).resolves.toBe('ok');
    expect(metricsService.observeHttpRequest).not.toHaveBeenCalled();
  });

  it('ignora o endpoint de metricas', async () => {
    const interceptor = new MetricsInterceptor(metricsService as any);
    const context = createHttpContext({ originalUrl: '/api/metrics' });

    await lastValueFrom(
      interceptor.intercept(context, { handle: () => of('ok') }),
    );

    expect(metricsService.observeHttpRequest).not.toHaveBeenCalled();
  });

  it('observa requisicao HTTP bem sucedida e marca spans de teste de carga', async () => {
    const span = { setAttributes: jest.fn() };
    (Sentry.getActiveSpan as jest.Mock).mockReturnValue(span);
    const interceptor = new MetricsInterceptor(metricsService as any);
    const context = createHttpContext({
      headers: {
        'x-etnos-load-test': ['auth-read-flow'],
      },
    });

    await lastValueFrom(
      interceptor.intercept(context, { handle: () => of('ok') }),
    );

    expect(metricsService.observeHttpRequest).toHaveBeenCalledWith(
      'GET',
      '/public/schools',
      200,
      expect.any(Number),
    );
    expect(span.setAttributes).toHaveBeenCalledWith({
      'etnos.load_test': 'auth-read-flow',
      'etnos.route': '/public/schools',
      'etnos.duration_ms': expect.any(Number),
    });
    expect(Sentry.logger.warn).not.toHaveBeenCalled();
  });

  it('usa path como rotulo quando a rota não tem path string', async () => {
    const interceptor = new MetricsInterceptor(metricsService as any);
    const context = createHttpContext({
      route: {},
      path: '/api/fallback',
    });

    await lastValueFrom(
      interceptor.intercept(context, { handle: () => of('ok') }),
    );

    expect(metricsService.observeHttpRequest).toHaveBeenCalledWith(
      'GET',
      '/api/fallback',
      200,
      expect.any(Number),
    );
  });

  it('usa unknown como rotulo quando path não estiver disponível', async () => {
    const interceptor = new MetricsInterceptor(metricsService as any);
    const context = createHttpContext({
      route: {},
      path: '',
    });

    await lastValueFrom(
      interceptor.intercept(context, { handle: () => of('ok') }),
    );

    expect(metricsService.observeHttpRequest).toHaveBeenCalledWith(
      'GET',
      'unknown',
      200,
      expect.any(Number),
    );
  });

  it('registra status de HttpException e loga anomalia quando habilitado', async () => {
    process.env.SENTRY_LOAD_TEST_ANOMALY_LOGS = 'true';
    const interceptor = new MetricsInterceptor(metricsService as any);
    const context = createHttpContext({
      headers: {
        'x-etnos-load-test': 'auth-read-flow',
      },
    });

    await expect(
      lastValueFrom(
        interceptor.intercept(context, {
          handle: () =>
            throwError(() => new HttpException('erro', HttpStatus.BAD_REQUEST)),
        }),
      ),
    ).rejects.toThrow(HttpException);

    expect(metricsService.observeHttpRequest).toHaveBeenCalledWith(
      'GET',
      '/public/schools',
      400,
      expect.any(Number),
    );
    expect(Sentry.logger.warn).not.toHaveBeenCalled();
  });

  it('registra erro inesperado como 500 e envia log de anomalia', async () => {
    process.env.SENTRY_LOAD_TEST_ANOMALY_LOGS = 'true';
    const interceptor = new MetricsInterceptor(metricsService as any);
    const context = createHttpContext({
      headers: {
        'x-etnos-load-test': 'auth-read-flow',
      },
    });

    await expect(
      lastValueFrom(
        interceptor.intercept(context, {
          handle: () => throwError(() => new Error('boom')),
        }),
      ),
    ).rejects.toThrow('boom');

    expect(metricsService.observeHttpRequest).toHaveBeenCalledWith(
      'GET',
      '/public/schools',
      500,
      expect.any(Number),
    );
    expect(Sentry.logger.warn).toHaveBeenCalledWith(
      'ETNOS load test request anomaly',
      expect.objectContaining({
        load_test: 'auth-read-flow',
        method: 'GET',
        route: '/public/schools',
        status_code: 500,
      }),
    );
  });
});
