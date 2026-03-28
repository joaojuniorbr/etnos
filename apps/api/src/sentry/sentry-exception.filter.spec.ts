import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';
import { SentryExceptionFilter } from './sentry-exception.filter';

describe('SentryExceptionFilter', () => {
  let filter: SentryExceptionFilter;
  let host: ArgumentsHost;

  const setupSpies = () => {
    const setTag = jest.fn();
    const setExtra = jest.fn();
    const withScope = jest.spyOn(Sentry, 'withScope');
    const captureException = jest
      .spyOn(Sentry, 'captureException')
      .mockImplementation(jest.fn());
    const loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(jest.fn());
    const baseCatch = jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation(jest.fn());

    withScope.mockImplementation(((callback: (scope: unknown) => void) => {
      if (typeof callback === 'function') {
        callback({ setTag, setExtra });
      }
    }) as never);

    return {
      setTag,
      setExtra,
      withScope,
      captureException,
      loggerError,
      baseCatch,
    };
  };

  beforeEach(() => {
    filter = new SentryExceptionFilter();
    host = {
      getType: jest.fn(() => 'http'),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve capturar HttpException com tags e extras no Sentry', () => {
    const {
      setTag,
      setExtra,
      withScope,
      captureException,
      loggerError,
      baseCatch,
    } = setupSpies();

    const exception = new HttpException(
      { message: 'Erro de teste', statusCode: 404 },
      404,
    );

    filter.catch(exception, host);

    expect(withScope).toHaveBeenCalledTimes(1);
    expect(setTag).toHaveBeenCalledWith('nestjs.context_type', 'http');
    expect(setTag).toHaveBeenCalledWith('http.exception', 'true');
    expect(setExtra).toHaveBeenCalledWith('status', 404);
    expect(setExtra).toHaveBeenCalledWith('response', {
      message: 'Erro de teste',
      statusCode: 404,
    });
    expect(captureException).toHaveBeenCalledWith(exception);
    expect(loggerError).toHaveBeenCalledWith(
      exception.message,
      exception.stack,
    );
    expect(baseCatch).toHaveBeenCalledWith(exception, host);
  });

  it('deve capturar excecao desconhecida sem logar erro quando nao for Error', () => {
    const {
      setTag,
      setExtra,
      withScope,
      captureException,
      loggerError,
      baseCatch,
    } = setupSpies();

    const exception = { message: 'objeto qualquer' };

    filter.catch(exception, host);

    expect(withScope).toHaveBeenCalledTimes(1);
    expect(setTag).toHaveBeenCalledWith('nestjs.context_type', 'http');
    expect(setExtra).not.toHaveBeenCalled();
    expect(captureException).toHaveBeenCalledWith(exception);
    expect(loggerError).not.toHaveBeenCalled();
    expect(baseCatch).toHaveBeenCalledWith(exception, host);
  });
});
