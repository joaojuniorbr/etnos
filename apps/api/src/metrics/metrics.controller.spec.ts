import { MetricsController } from './metrics.controller';

describe('MetricsController', () => {
  it('define o content-type do Prometheus e retorna as metricas', async () => {
    const metricsService = {
      contentType: 'text/plain; version=0.0.4',
      metrics: jest.fn().mockResolvedValue('metrics-body'),
    };
    const response = {
      setHeader: jest.fn(),
    };
    const controller = new MetricsController(metricsService as any);

    await expect(controller.getMetrics(response as any)).resolves.toBe(
      'metrics-body',
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      metricsService.contentType,
    );
  });
});
