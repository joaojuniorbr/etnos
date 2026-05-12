import { Injectable } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  register,
} from 'prom-client';

let defaultMetricsStarted = false;

@Injectable()
export class MetricsService {
  private readonly requestCounter: Counter<string>;
  private readonly requestDuration: Histogram<string>;

  constructor() {
    if (!defaultMetricsStarted) {
      collectDefaultMetrics({
        prefix: 'etnos_api_',
      });
      defaultMetricsStarted = true;
    }

    this.requestCounter =
      (register.getSingleMetric(
        'etnos_api_http_requests_total',
      ) as Counter<string>) ??
      new Counter({
        name: 'etnos_api_http_requests_total',
        help: 'Total de requisicoes HTTP processadas pela API ETNOS.',
        labelNames: ['method', 'route', 'status_code'],
      });

    this.requestDuration =
      (register.getSingleMetric(
        'etnos_api_http_request_duration_seconds',
      ) as Histogram<string>) ??
      new Histogram({
        name: 'etnos_api_http_request_duration_seconds',
        help: 'Duracao das requisicoes HTTP processadas pela API ETNOS.',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.05, 0.1, 0.2, 0.3, 0.6, 1, 2, 5],
      });
  }

  get contentType() {
    return register.contentType;
  }

  async metrics() {
    return register.metrics();
  }

  observeHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationSeconds: number,
  ) {
    const labels = {
      method,
      route,
      status_code: String(statusCode),
    };

    this.requestCounter.inc(labels);
    this.requestDuration.observe(labels, durationSeconds);
  }
}
