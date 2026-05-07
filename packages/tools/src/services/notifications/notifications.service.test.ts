import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({
	apiMock: {
		delete: vi.fn(),
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
	},
}));

vi.mock('../../helpers', () => ({
	api: apiMock,
}));

import { notificationsService } from './notifications.service';

describe('notificationsService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('registra token push', async () => {
		apiMock.post.mockResolvedValueOnce({ data: { ok: true } });

		const result = await notificationsService.registerPushToken({
			token: 'ExponentPushToken[token]',
			platform: 'android',
		});

		expect(apiMock.post).toHaveBeenCalledWith('/notifications/push-token', {
			token: 'ExponentPushToken[token]',
			platform: 'android',
		});
		expect(result).toEqual({ ok: true });
	});

	it('remove token push', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: { ok: true } });

		const result = await notificationsService.unregisterPushToken({
			token: 'ExponentPushToken[token]',
		});

		expect(apiMock.delete).toHaveBeenCalledWith('/notifications/push-token', {
			data: { token: 'ExponentPushToken[token]' },
		});
		expect(result).toEqual({ ok: true });
	});

	it('remove todos os tokens push quando payload não é informado', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: { ok: true } });

		const result = await notificationsService.unregisterPushToken();

		expect(apiMock.delete).toHaveBeenCalledWith(
			'/notifications/push-token',
			undefined,
		);
		expect(result).toEqual({ ok: true });
	});

	it('envia notificação', async () => {
		const payload = {
			title: 'Aviso',
			message: 'Mensagem',
			targetType: 'GLOBAL' as const,
		};
		apiMock.post.mockResolvedValueOnce({ data: { ok: true, sent: 2 } });

		const result = await notificationsService.send(payload);

		expect(apiMock.post).toHaveBeenCalledWith('/notifications/send', payload);
		expect(result).toEqual({ ok: true, sent: 2 });
	});

	it('conta destinatários habilitados para notificação', async () => {
		apiMock.get.mockResolvedValueOnce({ data: { count: 3 } });

		const result = await notificationsService.countRecipients({
			targetType: 'SCHOOL',
			schoolId: 'school-1',
		});

		expect(apiMock.get).toHaveBeenCalledWith(
			'/notifications/recipients-count',
			{
				params: { targetType: 'SCHOOL', schoolId: 'school-1' },
			},
		);
		expect(result).toEqual({ count: 3 });
	});

	it('lista histórico e templates', async () => {
		apiMock.get
			.mockResolvedValueOnce({ data: [{ id: 'log-1' }] })
			.mockResolvedValueOnce({ data: [{ id: 'template-1' }] });

		await expect(notificationsService.getHistory()).resolves.toEqual([
			{ id: 'log-1' },
		]);
		await expect(notificationsService.getTemplates()).resolves.toEqual([
			{ id: 'template-1' },
		]);

		expect(apiMock.get).toHaveBeenCalledWith('/notifications/history');
		expect(apiMock.get).toHaveBeenCalledWith('/notifications/templates');
	});

	it('cria, atualiza e remove template', async () => {
		apiMock.post.mockResolvedValueOnce({ data: { id: 'template-1' } });
		apiMock.put.mockResolvedValueOnce({ data: { id: 'template-1' } });
		apiMock.delete.mockResolvedValueOnce({ data: { ok: true } });

		await expect(
			notificationsService.createTemplate({
				title: 'Título',
				message: 'Mensagem',
			}),
		).resolves.toEqual({ id: 'template-1' });
		await expect(
			notificationsService.updateTemplate('template-1', {
				title: 'Novo título',
			}),
		).resolves.toEqual({ id: 'template-1' });
		await expect(
			notificationsService.deleteTemplate('template-1'),
		).resolves.toEqual({
			ok: true,
		});

		expect(apiMock.post).toHaveBeenCalledWith('/notifications/templates', {
			title: 'Título',
			message: 'Mensagem',
		});
		expect(apiMock.put).toHaveBeenCalledWith(
			'/notifications/templates/template-1',
			{
				title: 'Novo título',
			},
		);
		expect(apiMock.delete).toHaveBeenCalledWith(
			'/notifications/templates/template-1',
		);
	});
});
