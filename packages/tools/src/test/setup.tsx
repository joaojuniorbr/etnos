import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('antd', () => {
	return {
		message: {
			success: vi.fn(),
			error: vi.fn(),
		},
	};
});
