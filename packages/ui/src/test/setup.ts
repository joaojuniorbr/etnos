import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.stubGlobal('getComputedStyle', () => {
	return {
		getPropertyValue: () => '',
	};
});
