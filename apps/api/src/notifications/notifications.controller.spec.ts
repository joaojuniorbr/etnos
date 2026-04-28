import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { AdminRoleGuard, SchoolRoleGuard } from 'src/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationTargetType } from './dto/send-notification.dto';

jest.mock('expo-server-sdk', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockNotificationsService = {
    registerPushToken: jest.fn().mockResolvedValue({ ok: true }),
    send: jest.fn().mockResolvedValue({ ok: true, sent: 2 }),
    getHistory: jest.fn().mockResolvedValue([{ id: 'log-1' }]),
    getTemplates: jest.fn().mockResolvedValue([{ id: 'template-1' }]),
    createTemplate: jest.fn().mockResolvedValue({ id: 'template-1' }),
    updateTemplate: jest.fn().mockResolvedValue({ id: 'template-1' }),
    deleteTemplate: jest.fn().mockResolvedValue({ ok: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    })
      .overrideGuard(AuthGuard('firebase-auth'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminRoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(SchoolRoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get(NotificationsController);
    service = module.get(NotificationsService);
    jest.clearAllMocks();
  });

  it('registra token push do usuário autenticado', async () => {
    const dto = { token: 'ExponentPushToken[token]', platform: 'ios' };
    const result = await controller.registerPushToken(
      { user: { uid: 'firebase-1' } },
      dto,
    );

    expect(service.registerPushToken).toHaveBeenCalledWith('firebase-1', dto);
    expect(result).toEqual({ ok: true });
  });

  it('envia notificação usando uid autenticado', async () => {
    const dto = {
      title: 'Aviso',
      message: 'Mensagem',
      targetType: NotificationTargetType.SCHOOL,
      schoolId: 'school-1',
    };

    const result = await controller.send({ user: { uid: 'firebase-1' } }, dto);

    expect(service.send).toHaveBeenCalledWith('firebase-1', dto);
    expect(result).toEqual({ ok: true, sent: 2 });
  });

  it('lista histórico do usuário autenticado', async () => {
    const result = await controller.getHistory({ user: { uid: 'firebase-1' } });

    expect(service.getHistory).toHaveBeenCalledWith('firebase-1');
    expect(result).toEqual([{ id: 'log-1' }]);
  });

  it('gerencia templates de notificação', async () => {
    await expect(controller.getTemplates()).resolves.toEqual([
      { id: 'template-1' },
    ]);

    const createDto = { title: 'Título', message: 'Mensagem' };
    await expect(
      controller.createTemplate({ user: { uid: 'firebase-1' } }, createDto),
    ).resolves.toEqual({ id: 'template-1' });
    expect(service.createTemplate).toHaveBeenCalledWith(
      'firebase-1',
      createDto,
    );

    const updateDto = { title: 'Novo título' };
    await expect(
      controller.updateTemplate('template-1', updateDto),
    ).resolves.toEqual({ id: 'template-1' });
    expect(service.updateTemplate).toHaveBeenCalledWith(
      'template-1',
      updateDto,
    );

    await expect(controller.deleteTemplate('template-1')).resolves.toEqual({
      ok: true,
    });
    expect(service.deleteTemplate).toHaveBeenCalledWith('template-1');
  });
});
