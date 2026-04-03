import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppProviders } from './AppProviders';

const {
	queryClientConstructorMock,
	queryClientProviderMock,
	userProviderMock,
	mainLayoutMock,
	reactQueryDevtoolsMock,
} = vi.hoisted(() => ({
	queryClientConstructorMock: vi.fn(),
	queryClientProviderMock: vi.fn(),
	userProviderMock: vi.fn(),
	mainLayoutMock: vi.fn(),
	reactQueryDevtoolsMock: vi.fn(),
}));

function QueryClientMock(config: unknown) {
	queryClientConstructorMock(config);
}

vi.mock('@tanstack/react-query', () => ({
	QueryClient: QueryClientMock,
	QueryClientProvider: ({
		client,
		children,
	}: {
		client: unknown;
		children: React.ReactNode;
	}) => {
		queryClientProviderMock(client);
		return <div data-testid="query-client-provider">{children}</div>;
	},
}));

vi.mock('@tanstack/react-query-devtools', () => ({
	ReactQueryDevtools: () => {
		reactQueryDevtoolsMock();
		return <div data-testid="react-query-devtools" />;
	},
}));

vi.mock('../context', () => ({
	UserProvider: ({ children }: { children: React.ReactNode }) => {
		userProviderMock();
		return <div data-testid="user-provider">{children}</div>;
	},
}));

vi.mock('../@templates', () => ({
	MainLayout: ({ children }: { children: React.ReactNode }) => {
		mainLayoutMock();
		return <div data-testid="main-layout">{children}</div>;
	},
}));

describe('AppProviders', () => {
	it('renderiza providers compartilhados e o layout', () => {
		render(
			<AppProviders>
				<div>Conteudo da pagina</div>
			</AppProviders>,
		);

		expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
		expect(screen.getByTestId('user-provider')).toBeInTheDocument();
		expect(screen.getByTestId('main-layout')).toBeInTheDocument();
		expect(screen.getByText('Conteudo da pagina')).toBeInTheDocument();
		expect(queryClientConstructorMock).toHaveBeenCalledTimes(1);
		expect(queryClientProviderMock).toHaveBeenCalledTimes(1);
		expect(userProviderMock).toHaveBeenCalledTimes(1);
		expect(mainLayoutMock).toHaveBeenCalledTimes(1);
		expect(
			screen.queryByTestId('react-query-devtools'),
		).not.toBeInTheDocument();
	});

	it('renderiza React Query Devtools quando solicitado', () => {
		render(
			<AppProviders showDevtools>
				<div>Conteudo da pagina</div>
			</AppProviders>,
		);

		expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument();
		expect(reactQueryDevtoolsMock).toHaveBeenCalledTimes(1);
	});
});
