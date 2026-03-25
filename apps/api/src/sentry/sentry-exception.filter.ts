import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType();

    Sentry.withScope((scope) => {
      scope.setTag('nestjs.context_type', contextType);

      if (exception instanceof HttpException) {
        scope.setTag('http.exception', 'true');
        scope.setExtra('status', exception.getStatus());
        scope.setExtra('response', exception.getResponse());
      }

      Sentry.captureException(exception);
    });

    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    return super.catch(exception, host);
  }
}
