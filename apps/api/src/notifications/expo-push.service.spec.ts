import * as Sentry from '@sentry/nestjs';
import Expo from 'expo-server-sdk';
import { ExpoPushService } from './expo-push.service';

jest.mock('expo-server-sdk', () => ({
  __esModule: true,
  default: Object.assign(
    jest.fn(() => ({
      chunkPushNotifications: mockExpoConstructor.chunkPushNotifications,
      sendPushNotificationsAsync:
        mockExpoConstructor.sendPushNotificationsAsync,
    })),
    {
      isExpoPushToken: jest.fn(),
      chunkPushNotifications: jest.fn(),
      sendPushNotificationsAsync: jest.fn(),
    },
  ),
}));

jest.mock('@sentry/nestjs', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  withScope: jest.fn((callback) =>
    callback({
      setTag: jest.fn(),
      setExtra: jest.fn(),
    }),
  ),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

const mockExpoConstructor = Expo as unknown as jest.Mock & {
  isExpoPushToken: jest.Mock;
  chunkPushNotifications: jest.Mock;
  sendPushNotificationsAsync: jest.Mock;
};

describe('ExpoPushService', () => {
  let prismaService: any;
  let configService: any;
  let service: ExpoPushService;

  beforeEach(() => {
    prismaService = {
      userPushToken: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    configService = {
      get: jest.fn().mockReturnValue('expo-access-token'),
    };
    mockExpoConstructor.mockClear();
    mockExpoConstructor.isExpoPushToken.mockReset();
    mockExpoConstructor.chunkPushNotifications.mockReset();
    mockExpoConstructor.sendPushNotificationsAsync.mockReset();
    jest.clearAllMocks();
    service = new ExpoPushService(prismaService, configService);
  });

  it('inicializa Expo com access token configurado', () => {
    expect(configService.get).toHaveBeenCalledWith('EXPO_ACCESS_TOKEN');
    expect(mockExpoConstructor).toHaveBeenCalledWith({
      accessToken: 'expo-access-token',
    });
  });

  it('retorna zero quando não há tokens', async () => {
    await expect(service.sendToTokens([], 'Título', 'Mensagem')).resolves.toBe(
      0,
    );
    expect(mockExpoConstructor.chunkPushNotifications).not.toHaveBeenCalled();
  });

  it('ignora tokens inválidos', async () => {
    mockExpoConstructor.isExpoPushToken.mockReturnValue(false);

    await expect(
      service.sendToTokens(['token-invalido'], 'Título', 'Mensagem'),
    ).resolves.toBe(0);
    expect(
      mockExpoConstructor.sendPushNotificationsAsync,
    ).not.toHaveBeenCalled();
  });

  it('envia chunks, conta sucessos e remove tokens expirados', async () => {
    mockExpoConstructor.isExpoPushToken.mockReturnValue(true);
    mockExpoConstructor.chunkPushNotifications.mockReturnValue([
      [
        { to: 'ExponentPushToken[1]', title: 'Título', body: 'Mensagem' },
        { to: 'ExponentPushToken[2]', title: 'Título', body: 'Mensagem' },
        { to: 'ExponentPushToken[3]', title: 'Título', body: 'Mensagem' },
      ],
    ]);
    mockExpoConstructor.sendPushNotificationsAsync.mockResolvedValue([
      { status: 'ok' },
      {
        status: 'error',
        message: 'dispositivo removido',
        details: { error: 'DeviceNotRegistered' },
      },
      {
        status: 'error',
        message: 'mensagem grande',
        details: { error: 'MessageTooBig' },
      },
    ]);

    const result = await service.sendToTokens(
      ['ExponentPushToken[1]', 'ExponentPushToken[2]', 'ExponentPushToken[3]'],
      'Título',
      'Mensagem',
      { source: 'test' },
    );

    expect(result).toBe(1);
    expect(mockExpoConstructor.chunkPushNotifications).toHaveBeenCalledWith([
      expect.objectContaining({
        to: 'ExponentPushToken[1]',
        title: 'Título',
        body: 'Mensagem',
        sound: 'default',
        data: { source: 'test' },
      }),
      expect.objectContaining({ to: 'ExponentPushToken[2]' }),
      expect.objectContaining({ to: 'ExponentPushToken[3]' }),
    ]);
    expect(prismaService.userPushToken.deleteMany).toHaveBeenCalledWith({
      where: { token: { in: ['ExponentPushToken[2]'] } },
    });
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Expo push ticket error: MessageTooBig',
      'warning',
    );
  });

  it('captura erro de chunk e continua execução', async () => {
    const error = new Error('expo indisponível');
    mockExpoConstructor.isExpoPushToken.mockReturnValue(true);
    mockExpoConstructor.chunkPushNotifications.mockReturnValue([
      [{ to: 'ExponentPushToken[1]' }],
    ]);
    mockExpoConstructor.sendPushNotificationsAsync.mockRejectedValue(error);

    await expect(
      service.sendToTokens(['ExponentPushToken[1]'], 'Título', 'Mensagem'),
    ).resolves.toBe(0);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('captura erro ao limpar tokens expirados', async () => {
    const cleanupError = new Error('delete falhou');
    prismaService.userPushToken.deleteMany.mockRejectedValue(cleanupError);
    mockExpoConstructor.isExpoPushToken.mockReturnValue(true);
    mockExpoConstructor.chunkPushNotifications.mockReturnValue([
      [{ to: 'ExponentPushToken[1]' }],
    ]);
    mockExpoConstructor.sendPushNotificationsAsync.mockResolvedValue([
      {
        status: 'error',
        message: 'dispositivo removido',
        details: { error: 'DeviceNotRegistered' },
      },
    ]);

    await expect(
      service.sendToTokens(['ExponentPushToken[1]'], 'Título', 'Mensagem'),
    ).resolves.toBe(0);
    expect(Sentry.captureException).toHaveBeenCalledWith(cleanupError);
  });

  it('usa "unknown" quando ticket de erro não tem details nem message', async () => {
    mockExpoConstructor.isExpoPushToken.mockReturnValue(true);
    mockExpoConstructor.chunkPushNotifications.mockReturnValue([
      [{ to: 'ExponentPushToken[1]' }],
    ]);
    mockExpoConstructor.sendPushNotificationsAsync.mockResolvedValue([
      { status: 'error' },
    ]);

    await expect(
      service.sendToTokens(['ExponentPushToken[1]'], 'Título', 'Mensagem'),
    ).resolves.toBe(0);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Expo push ticket error: unknown',
      'warning',
    );
  });
});
