import { describe, expect, it } from 'vitest';
import { notificationKeys } from './notifications';

describe('notificationKeys', () => {
	it('retorna chaves de notificacoes', () => {
		expect(notificationKeys.templates()).toEqual(['notifications', 'templates']);
		expect(notificationKeys.history()).toEqual(['notifications', 'history']);
		expect(notificationKeys.recipientsCount('school')).toEqual([
			'notifications',
			'recipients-count',
			'school',
			'none',
			'none',
		]);
		expect(
			notificationKeys.recipientsCount('user', 'school-1', 'user-1'),
		).toEqual([
			'notifications',
			'recipients-count',
			'user',
			'school-1',
			'user-1',
		]);
	});
});
