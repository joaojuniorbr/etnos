import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({
	apiMock: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
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

	it('registra push token', async () => {
		apiMock.post.mockResolvedValueOnce({ data: { ok: true } });

		const result = await notificationsService.registerPushToken({
			token: 'push-token-123',
		});

		expect(apiMock.post).toHaveBeenCalledWith('/notifications/push-token', {
			token: 'push-token-123',
		});
		expect(result).toEqual({ ok: true });
	});

	it('envia notificação', async () => {
		apiMock.post.mockResolvedValueOnce({ data: { ok: true, sent: 5 } });

		const result = await notificationsService.send({
			title: 'Teste',
			body: 'Mensagem de teste',
		});

		expect(apiMock.post).toHaveBeenCalledWith('/notifications/send', {
			title: 'Teste',
			body: 'Mensagem de teste',
		});
		expect(result).toEqual({ ok: true, sent: 5 });
	});

	it('obtém histórico de notificações', async () => {
		const mockHistory = [
			{ id: '1', title: 'Notificação 1', read: true },
			{ id: '2', title: 'Notificação 2', read: false },
		];
		apiMock.get.mockResolvedValueOnce({ data: mockHistory });

		const result = await notificationsService.getHistory();

		expect(apiMock.get).toHaveBeenCalledWith('/notifications/history');
		expect(result).toEqual(mockHistory);
	});

	it('obtém templates de notificações', async () => {
		const mockTemplates = [
			{ id: '1', name: 'Template 1', content: 'Conteúdo' },
		];
		apiMock.get.mockResolvedValueOnce({ data: mockTemplates });

		const result = await notificationsService.getTemplates();

		expect(apiMock.get).toHaveBeenCalledWith('/notifications/templates');
		expect(result).toEqual(mockTemplates);
	});

	it('cria template de notificação', async () => {
		const mockTemplate = { id: '1', name: 'Novo Template', content: 'Conteúdo' };
		apiMock.post.mockResolvedValueOnce({ data: mockTemplate });

		const result = await notificationsService.createTemplate({
			name: 'Novo Template',
			content: 'Conteúdo',
		});

		expect(apiMock.post).toHaveBeenCalledWith('/notifications/templates', {
			name: 'Novo Template',
			content: 'Conteúdo',
		});
		expect(result).toEqual(mockTemplate);
	});

	it('atualiza template de notificação', async () => {
		const mockTemplate = { id: '1', name: 'Template Atualizado', content: 'Novo Conteúdo' };
		apiMock.put.mockResolvedValueOnce({ data: mockTemplate });

		const result = await notificationsService.updateTemplate('1', {
			name: 'Template Atualizado',
			content: 'Novo Conteúdo',
		});

		expect(apiMock.put).toHaveBeenCalledWith('/notifications/templates/1', {
			name: 'Template Atualizado',
			content: 'Novo Conteúdo',
		});
		expect(result).toEqual(mockTemplate);
	});

	it('deleta template de notificação', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: { ok: true } });

		const result = await notificationsService.deleteTemplate('1');

		expect(apiMock.delete).toHaveBeenCalledWith('/notifications/templates/1');
		expect(result).toEqual({ ok: true });
	});
});
