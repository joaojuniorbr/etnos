import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { NotificationsService } from './notifications.service';
import { ExpoPushService } from './expo-push.service';
import { NotificationTargetType } from './dto/send-notification.dto';

jest.mock('expo-server-sdk', () => ({
  __esModule: true,
  default: jest.fn(),
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

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: any;
  let expoPushService: jest.Mocked<Pick<ExpoPushService, 'sendToTokens'>>;

  beforeEach(() => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      userPushToken: {
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      schoolAccess: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      school: {
        findUnique: jest.fn(),
      },
      notificationLog: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      notificationTemplate: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    expoPushService = {
      sendToTokens: jest.fn(),
    };
    service = new NotificationsService(
      prismaService,
      expoPushService as unknown as ExpoPushService,
    );
    jest.clearAllMocks();
  });

  it('registra token push para usuário existente', async () => {
    prismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.registerPushToken('firebase-1', {
        token: 'ExponentPushToken[token]',
        platform: 'android',
      }),
    ).resolves.toEqual({ ok: true });

    expect(prismaService.userPushToken.upsert).toHaveBeenCalledWith({
      where: { token: 'ExponentPushToken[token]' },
      create: {
        userId: 'user-1',
        token: 'ExponentPushToken[token]',
        platform: 'android',
      },
      update: { userId: 'user-1', platform: 'android' },
    });
  });

  it('lança erro ao registrar token de usuário inexistente', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      service.registerPushToken('firebase-1', {
        token: 'ExponentPushToken[token]',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('registra token push sem plataforma e loga como "unknown"', async () => {
    prismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.registerPushToken('firebase-1', {
        token: 'ExponentPushToken[token]',
      }),
    ).resolves.toEqual({ ok: true });

    expect(Sentry.logger.info).toHaveBeenCalledWith(
      'notifications.push_token.registered',
      expect.objectContaining({ platform: 'unknown' }),
    );
  });

  it('impede envio global por usuário não admin', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      roles: ['school'],
      school: null,
    });

    await expect(
      service.send('firebase-1', {
        title: 'Aviso',
        message: 'Mensagem',
        targetType: NotificationTargetType.GLOBAL,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lança erro ao enviar como usuário inexistente', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      service.send('firebase-1', {
        title: 'Aviso',
        message: 'Mensagem',
        targetType: NotificationTargetType.GLOBAL,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('exige schoolId para envio por escola', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'school@test.com',
      roles: ['school'],
      school: null,
    });

    await expect(
      service.send('firebase-1', {
        title: 'Aviso',
        message: 'Mensagem',
        targetType: NotificationTargetType.SCHOOL,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('impede envio para escola sem acesso', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'school@test.com',
      roles: ['school'],
      school: null,
    });
    prismaService.schoolAccess.findFirst.mockResolvedValue(null);

    await expect(
      service.send('firebase-1', {
        title: 'Aviso',
        message: 'Mensagem',
        targetType: NotificationTargetType.SCHOOL,
        schoolId: 'school-1',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('impede envio para escola quando usuário não é admin nem escola', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      roles: ['student'],
      school: null,
    });

    await expect(
      service.send('firebase-1', {
        title: 'Aviso',
        message: 'Mensagem',
        targetType: NotificationTargetType.SCHOOL,
        schoolId: 'school-1',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('envia notificação para escola e salva histórico', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'sender-1',
      email: 'school@test.com',
      roles: ['school'],
      school: null,
    });
    prismaService.schoolAccess.findFirst.mockResolvedValue({ id: 'access-1' });
    prismaService.school.findUnique
      .mockResolvedValueOnce({ id: 'school-1', code: 'ESCOLA' })
      .mockResolvedValueOnce({ name: 'Escola Teste' });
    prismaService.user.findMany.mockResolvedValue([
      { id: 'student-1' },
      { id: 'student-2' },
    ]);
    prismaService.userPushToken.findMany.mockResolvedValue([
      { token: 'ExponentPushToken[1]' },
      { token: 'ExponentPushToken[2]' },
    ]);
    expoPushService.sendToTokens.mockResolvedValue(2);

    const result = await service.send('firebase-1', {
      title: 'Aviso',
      message: 'Mensagem',
      targetType: NotificationTargetType.SCHOOL,
      schoolId: 'school-1',
    });

    expect(expoPushService.sendToTokens).toHaveBeenCalledWith(
      ['ExponentPushToken[1]', 'ExponentPushToken[2]'],
      'Aviso',
      'Mensagem',
      undefined,
    );
    expect(prismaService.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Aviso',
        message: 'Mensagem',
        targetType: NotificationTargetType.SCHOOL,
        schoolId: 'school-1',
        schoolName: 'Escola Teste',
        sentBy: 'sender-1',
        sentByEmail: 'school@test.com',
        tokenCount: 2,
      }),
    });
    expect(result).toEqual({ ok: true, sent: 2 });
  });

  it('envia notificação individual quando remetente é admin', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: null,
      roles: ['admin'],
      school: null,
    });
    prismaService.userPushToken.findMany.mockResolvedValue([
      { token: 'ExponentPushToken[1]' },
    ]);
    expoPushService.sendToTokens.mockResolvedValue(1);

    await expect(
      service.send('firebase-admin', {
        title: 'Aviso',
        message: 'Mensagem',
        targetType: NotificationTargetType.INDIVIDUAL,
        userId: 'user-1',
      }),
    ).resolves.toEqual({ ok: true, sent: 1 });

    expect(prismaService.userPushToken.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      select: { token: true },
    });
  });

  it('registra histórico mesmo quando não há tokens resolvidos', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      roles: ['admin'],
      school: null,
    });
    prismaService.userPushToken.findMany.mockResolvedValue([]);
    expoPushService.sendToTokens.mockResolvedValue(0);

    await expect(
      service.send('firebase-admin', {
        title: 'Aviso',
        message: 'Mensagem',
        targetType: NotificationTargetType.GLOBAL,
      }),
    ).resolves.toEqual({ ok: true, sent: 0 });

    expect(expoPushService.sendToTokens).toHaveBeenCalledWith(
      [],
      'Aviso',
      'Mensagem',
      undefined,
    );
    expect(prismaService.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tokenCount: 0 }),
    });
  });

  it('envia zero quando alvo individual não informa userId', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: null,
      roles: ['admin'],
      school: null,
    });
    expoPushService.sendToTokens.mockResolvedValue(0);

    await expect(
      service.send('firebase-admin', {
        title: 'Aviso',
        message: 'Mensagem',
        targetType: NotificationTargetType.INDIVIDUAL,
      }),
    ).resolves.toEqual({ ok: true, sent: 0 });

    expect(prismaService.userPushToken.findMany).not.toHaveBeenCalled();
  });

  it('captura erro do provedor de push e relança', async () => {
    const error = new Error('expo fora');
    prismaService.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      roles: ['admin'],
      school: null,
    });
    prismaService.userPushToken.findMany.mockResolvedValue([
      { token: 'ExponentPushToken[1]' },
    ]);
    expoPushService.sendToTokens.mockRejectedValue(error);

    await expect(
      service.send('firebase-admin', {
        title: 'Aviso',
        message: 'Mensagem',
        targetType: NotificationTargetType.GLOBAL,
      }),
    ).rejects.toThrow(error);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('retorna histórico global para admin', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      roles: ['admin'],
    });
    prismaService.notificationLog.findMany.mockResolvedValue([{ id: 'log-1' }]);

    await expect(service.getHistory('firebase-admin')).resolves.toEqual([
      { id: 'log-1' },
    ]);
    expect(prismaService.notificationLog.findMany).toHaveBeenCalledWith({
      orderBy: { sentAt: 'desc' },
      take: 200,
    });
  });

  it('retorna histórico das escolas acessíveis para usuário escolar', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'user-1',
      roles: ['school'],
    });
    prismaService.schoolAccess.findMany.mockResolvedValue([
      { schoolId: 'school-1' },
      { schoolId: 'school-2' },
    ]);
    prismaService.notificationLog.findMany.mockResolvedValue([{ id: 'log-1' }]);

    await expect(service.getHistory('firebase-1')).resolves.toEqual([
      { id: 'log-1' },
    ]);
    expect(prismaService.notificationLog.findMany).toHaveBeenCalledWith({
      where: { schoolId: { in: ['school-1', 'school-2'] } },
      orderBy: { sentAt: 'desc' },
      take: 200,
    });
  });

  it('lança erro ao buscar histórico de usuário inexistente', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.getHistory('firebase-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lista e cria templates', async () => {
    prismaService.notificationTemplate.findMany.mockResolvedValue([
      { id: 'template-1' },
    ]);
    prismaService.notificationTemplate.create.mockResolvedValue({
      id: 'template-2',
      title: 'Título',
      message: 'Mensagem',
    });

    await expect(service.getTemplates()).resolves.toEqual([
      { id: 'template-1' },
    ]);
    expect(prismaService.notificationTemplate.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });

    await expect(
      service.createTemplate('firebase-1', {
        title: 'Título',
        message: 'Mensagem',
      }),
    ).resolves.toEqual({
      id: 'template-2',
      title: 'Título',
      message: 'Mensagem',
    });
    expect(prismaService.notificationTemplate.create).toHaveBeenCalledWith({
      data: {
        title: 'Título',
        message: 'Mensagem',
        createdBy: 'firebase-1',
      },
    });
  });

  it('atualiza e remove templates existentes', async () => {
    prismaService.notificationTemplate.findUnique.mockResolvedValue({
      id: 'template-1',
    });
    prismaService.notificationTemplate.update.mockResolvedValue({
      id: 'template-1',
      title: 'Novo título',
    });

    await expect(
      service.updateTemplate('template-1', { title: 'Novo título' }),
    ).resolves.toEqual({ id: 'template-1', title: 'Novo título' });
    expect(prismaService.notificationTemplate.update).toHaveBeenCalledWith({
      where: { id: 'template-1' },
      data: { title: 'Novo título' },
    });

    await expect(service.deleteTemplate('template-1')).resolves.toEqual({
      ok: true,
    });
    expect(prismaService.notificationTemplate.delete).toHaveBeenCalledWith({
      where: { id: 'template-1' },
    });
  });

  it('lança erro ao alterar template inexistente', async () => {
    prismaService.notificationTemplate.findUnique.mockResolvedValue(null);

    await expect(
      service.updateTemplate('template-1', { message: 'Mensagem' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('atualiza template com apenas mensagem sem alterar título', async () => {
    prismaService.notificationTemplate.findUnique.mockResolvedValue({
      id: 'template-1',
    });
    prismaService.notificationTemplate.update.mockResolvedValue({
      id: 'template-1',
      message: 'Nova mensagem',
    });

    await expect(
      service.updateTemplate('template-1', { message: 'Nova mensagem' }),
    ).resolves.toEqual({ id: 'template-1', message: 'Nova mensagem' });
    expect(prismaService.notificationTemplate.update).toHaveBeenCalledWith({
      where: { id: 'template-1' },
      data: { message: 'Nova mensagem' },
    });
  });

  it('retorna zero quando escola não é encontrada em resolveTokens', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      roles: ['admin'],
      school: null,
    });
    prismaService.school.findUnique.mockResolvedValue(null);
    expoPushService.sendToTokens.mockResolvedValue(0);

    const result = await service.send('firebase-admin', {
      title: 'Aviso',
      message: 'Mensagem',
      targetType: NotificationTargetType.SCHOOL,
      schoolId: 'school-x',
    });

    expect(result).toEqual({ ok: true, sent: 0 });
    expect(expoPushService.sendToTokens).toHaveBeenCalledWith(
      [],
      'Aviso',
      'Mensagem',
      undefined,
    );
    expect(prismaService.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ schoolName: null }),
    });
  });

  it('retorna zero quando escola não tem usuários em resolveTokens', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      roles: ['admin'],
      school: null,
    });
    prismaService.school.findUnique
      .mockResolvedValueOnce({ id: 'school-1', code: 'ESCOLA' })
      .mockResolvedValueOnce({ name: 'Escola Teste' });
    prismaService.user.findMany.mockResolvedValue([]);
    expoPushService.sendToTokens.mockResolvedValue(0);

    const result = await service.send('firebase-admin', {
      title: 'Aviso',
      message: 'Mensagem',
      targetType: NotificationTargetType.SCHOOL,
      schoolId: 'school-1',
    });

    expect(result).toEqual({ ok: true, sent: 0 });
    expect(expoPushService.sendToTokens).toHaveBeenCalledWith(
      [],
      'Aviso',
      'Mensagem',
      undefined,
    );
    expect(prismaService.userPushToken.findMany).not.toHaveBeenCalled();
  });

  it('envia notificação para escola sem code e busca apenas por id', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'sender-1',
      email: 'school@test.com',
      roles: ['school'],
      school: null,
    });
    prismaService.schoolAccess.findFirst.mockResolvedValue({ id: 'access-1' });
    prismaService.school.findUnique
      .mockResolvedValueOnce({ id: 'school-1', code: null })
      .mockResolvedValueOnce({ name: 'Escola Teste' });
    prismaService.user.findMany.mockResolvedValue([
      { id: 'student-1' },
      { id: 'student-2' },
    ]);
    prismaService.userPushToken.findMany.mockResolvedValue([
      { token: 'ExponentPushToken[1]' },
      { token: 'ExponentPushToken[2]' },
    ]);
    expoPushService.sendToTokens.mockResolvedValue(2);

    const result = await service.send('firebase-1', {
      title: 'Aviso',
      message: 'Mensagem',
      targetType: NotificationTargetType.SCHOOL,
      schoolId: 'school-1',
    });

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ school: 'school-1' }],
      },
      select: { id: true },
    });
    expect(result).toEqual({ ok: true, sent: 2 });
  });
});
