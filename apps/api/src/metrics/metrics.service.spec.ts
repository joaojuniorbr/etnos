const inc = jest.fn();
const observe = jest.fn();
const getSingleMetric = jest.fn();
const metrics = jest.fn().mockResolvedValue('metrics');
const collectDefaultMetrics = jest.fn();
const Counter = jest.fn(() => ({ inc }));
const Histogram = jest.fn(() => ({ observe }));

jest.mock('prom-client', () => ({
  collectDefaultMetrics,
  Counter,
  Histogram,
  register: {
    contentType: 'text/plain',
    getSingleMetric,
    metrics,
  },
}));

describe('MetricsService', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    getSingleMetric.mockReturnValue(undefined);
  });

  it('cria metricas Prometheus e observa requisicoes HTTP', async () => {
    const { MetricsService } = await import('./metrics.service');
    const service = new MetricsService();

    expect(collectDefaultMetrics).toHaveBeenCalledWith({
      prefix: 'etnos_api_',
    });
    expect(Counter).toHaveBeenCalledWith({
      name: 'etnos_api_http_requests_total',
      help: 'Total de requisicoes HTTP processadas pela API ETNOS.',
      labelNames: ['method', 'route', 'status_code'],
    });
    expect(Histogram).toHaveBeenCalledWith({
      name: 'etnos_api_http_request_duration_seconds',
      help: 'Duracao das requisicoes HTTP processadas pela API ETNOS.',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.05, 0.1, 0.2, 0.3, 0.6, 1, 2, 5],
    });

    service.observeHttpRequest('GET', '/public/schools', 200, 0.123);

    expect(inc).toHaveBeenCalledWith({
      method: 'GET',
      route: '/public/schools',
      status_code: '200',
    });
    expect(observe).toHaveBeenCalledWith(
      {
        method: 'GET',
        route: '/public/schools',
        status_code: '200',
      },
      0.123,
    );
    await expect(service.metrics()).resolves.toBe('metrics');
    expect(service.contentType).toBe('text/plain');
  });

  it('reutiliza metricas registradas quando já existem', async () => {
    const counter = { inc };
    const histogram = { observe };
    getSingleMetric.mockReturnValueOnce(counter).mockReturnValueOnce(histogram);

    const { MetricsService } = await import('./metrics.service');
    const service = new MetricsService();

    service.observeHttpRequest('POST', '/auth/login', 201, 1);

    expect(Counter).not.toHaveBeenCalled();
    expect(Histogram).not.toHaveBeenCalled();
    expect(inc).toHaveBeenCalledWith({
      method: 'POST',
      route: '/auth/login',
      status_code: '201',
    });
  });
});
