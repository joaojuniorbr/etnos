import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Request, Response } from 'express';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    if (request.originalUrl?.startsWith('/api/metrics')) {
      return next.handle();
    }

    const startedAt = process.hrtime.bigint();
    let errorStatusCode: number | undefined;

    return next.handle().pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpException) {
          errorStatusCode = error.getStatus();
        } else {
          errorStatusCode = 500;
        }

        return throwError(() => error);
      }),
      finalize(() => {
        const durationSeconds =
          Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
        const statusCode = errorStatusCode ?? response.statusCode;
        const route = this.getRouteLabel(request);
        const loadTestName = this.getHeader(request, 'x-etnos-load-test');

        this.metricsService.observeHttpRequest(
          request.method,
          route,
          statusCode,
          durationSeconds,
        );

        if (loadTestName) {
          this.addLoadTestAttributes(loadTestName, route, durationSeconds);
          this.logLoadTestAnomaly(
            loadTestName,
            request.method,
            route,
            statusCode,
            durationSeconds,
          );
        }
      }),
    );
  }

  private getRouteLabel(request: Request) {
    const routePath = request.route?.path;

    if (typeof routePath === 'string') {
      return routePath;
    }

    return request.path || 'unknown';
  }

  private getHeader(request: Request, name: string) {
    const value = request.headers[name];

    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }

  private addLoadTestAttributes(
    loadTestName: string,
    route: string,
    durationSeconds: number,
  ) {
    const activeSpan = Sentry.getActiveSpan();

    activeSpan?.setAttributes({
      'etnos.load_test': loadTestName,
      'etnos.route': route,
      'etnos.duration_ms': Math.round(durationSeconds * 1000),
    });
  }

  private logLoadTestAnomaly(
    loadTestName: string,
    method: string,
    route: string,
    statusCode: number,
    durationSeconds: number,
  ) {
    const durationMs = Math.round(durationSeconds * 1000);

    if (process.env.SENTRY_LOAD_TEST_ANOMALY_LOGS !== 'true') {
      return;
    }

    if (statusCode < 500 && durationMs < 600) {
      return;
    }

    Sentry.logger.warn('ETNOS load test request anomaly', {
      load_test: loadTestName,
      method,
      route,
      status_code: statusCode,
      duration_ms: durationMs,
    });
  }
}
