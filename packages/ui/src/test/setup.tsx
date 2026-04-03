import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

class ResizeObserverMock {
	observe() {
		return null;
	}
	unobserve() {
		return null;
	}
	disconnect() {
		return null;
	}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

vi.stubGlobal('getComputedStyle', () => {
	return {
		getPropertyValue: () => '',
	};
});

vi.stubGlobal('open', vi.fn());

export const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});

	const Wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	Wrapper.displayName = 'QueryClientProviderWrapper';
	return Wrapper;
};
