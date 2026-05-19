import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	formatClassRank,
	formatDashboardScore,
	formatRelativeTime,
} from './student-dashboard.utils';

describe('student-dashboard.utils', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-05-18T12:00:00'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('formata pontuação em pt-BR', () => {
		expect(formatDashboardScore(1250)).toBe('1.250');
	});

	it('formata ranking da turma', () => {
		expect(formatClassRank(3)).toBe('3º');
		expect(formatClassRank(null)).toBe('—');
	});

	it('formata tempo relativo para hoje, ontem e dias', () => {
		expect(formatRelativeTime('2026-05-18T08:00:00.000Z')).toBe('Hoje');
		expect(formatRelativeTime('2026-05-17T08:00:00.000Z')).toBe('Ontem');
		expect(formatRelativeTime('2026-05-15T08:00:00.000Z')).toBe('2 dias');
	});

	it('formata data completa quando a atividade é mais antiga que uma semana', () => {
		expect(formatRelativeTime('2026-05-01T08:00:00.000Z')).toBe('01 de mai.');
	});
});
