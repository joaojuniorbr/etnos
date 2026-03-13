import { render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProtected, redirectIfUnauthenticated } from './AuthProtected';

const useAuthMock = vi.fn();
const originalLocation = globalThis.window.location;

vi.mock('@etnos/tools', () => ({
	useAuth: () => useAuthMock(),
}));

vi.mock('antd', () => ({
	Spin: ({
		spinning,
		children,
	}: {
		spinning?: boolean;
		children: React.ReactNode;
	}) => (
		<div data-testid='spin' data-spinning={String(!!spinning)}>
			{children}
		</div>
	),
}));

describe('AuthProtected', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(globalThis.window, 'location', {
			configurable: true,
			value: {
				href: 'http://localhost/',
			},
		});
	});

	it('renderiza children quando usuário está autenticado', () => {
		useAuthMock.mockReturnValue({
			user: { uid: 'user-1', email: 'user@test.com' },
			isProfileLoading: false,
		});

		render(
			<AuthProtected>
				<div>Conteudo protegido</div>
			</AuthProtected>,
		);

		expect(screen.getByText('Conteudo protegido')).toBeInTheDocument();
		expect(screen.getByTestId('spin')).toHaveAttribute(
			'data-spinning',
			'false',
		);
	});

	it('mantém loading enquanto perfil está carregando', () => {
		useAuthMock.mockReturnValue({
			user: null,
			isProfileLoading: true,
		});

		render(
			<AuthProtected>
				<div>Conteudo protegido</div>
			</AuthProtected>,
		);

		expect(screen.getByTestId('spin')).toHaveAttribute(
			'data-spinning',
			'true',
		);
		expect(screen.getByText('Conteudo protegido')).toBeInTheDocument();
	});

	it('redireciona para login quando usuário não está autenticado', async () => {
		useAuthMock.mockReturnValue({
			user: null,
			isProfileLoading: false,
		});

		const { container } = render(
			<AuthProtected redirectTo='/login'>
				<div>Conteudo protegido</div>
			</AuthProtected>,
		);

		expect(container).toBeEmptyDOMElement();

		await waitFor(() => {
			expect(globalThis.window.location.href).toBe('/login');
		});
	});

	it('não tenta redirecionar quando window não está disponível', () => {
		expect(() =>
			redirectIfUnauthenticated({
				browserWindow: undefined,
				isProfileLoading: false,
				redirectTo: '/login',
				user: null,
			}),
		).not.toThrow();
	});
});

afterAll(() => {
	Object.defineProperty(globalThis.window, 'location', {
		configurable: true,
		value: originalLocation,
	});
});
