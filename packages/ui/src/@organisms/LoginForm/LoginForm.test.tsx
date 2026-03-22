import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';
import { message } from 'antd';

const resetFieldsMock = vi.fn();
const useAuthMock = vi.fn();
const randomPassword = () =>
	`pw-${Math.random().toString(36).slice(2, 12)}-Aa1!`;

vi.mock('@etnos/tools', () => ({
	useAuth: () => useAuthMock(),
}));

vi.mock('../../@atoms', () => ({
	Button: ({
		children,
		htmlType,
		block: _block,
		...props
	}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
		htmlType?: 'button' | 'submit' | 'reset';
		block?: boolean;
	}) => {
		return (
			<button type={htmlType ?? 'button'} {...props}>
				{children}
			</button>
		);
	},
}));

vi.mock('../../@molecules', () => ({
	ResetPasswordForm: ({ onSubmit }: { onSubmit: () => void }) => (
		<div>
			<button type='button' onClick={onSubmit}>
				Fechar reset
			</button>
			<div data-testid='reset-password-form'>Reset Password Form</div>
		</div>
	),
}));

vi.mock('antd', async () => {
	const React = await import('react');

	type FormProps = {
		children: React.ReactNode;
		onFinish?: (values: { login: string; password: string }) => void;
	};

	type ItemProps = {
		children: React.ReactElement;
		label?: string;
		name: string;
	};

	const FormComponent = ({ children, onFinish }: FormProps) => {
		return (
			<form
				onSubmit={(event) => {
					event.preventDefault();
					const formData = new FormData(event.currentTarget);
					const login = String(formData.get('login') ?? '');
					const password = String(formData.get('password') ?? '');

					if (!login || !password) return;

					onFinish?.({ login, password });
				}}
			>
				{children}
			</form>
		);
	};

	const FormItem = ({ children, label, name }: ItemProps) => {
		return (
			<label>
				{label}
				{React.cloneElement(children, {
					name,
				} as React.InputHTMLAttributes<HTMLInputElement>)}
			</label>
		);
	};

	const Form = Object.assign(FormComponent, {
		Item: FormItem,
		useForm: () => [{ resetFields: resetFieldsMock }],
	});

	const Input = Object.assign(
		(props: React.InputHTMLAttributes<HTMLInputElement>) => (
			<input {...props} />
		),
		{
			Password: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
				<input type='password' {...props} />
			),
		}
	);

	return {
		Divider: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Form,
		Input,
		Modal: ({
			open,
			children,
		}: {
			open?: boolean;
			children: React.ReactNode;
		}) =>
			open ? <div data-testid='modal'>{children}</div> : null,
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
		message: {
			error: vi.fn(),
		},
	};
});

describe('LoginForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetFieldsMock.mockClear();
	});

	it('não envia login se email/senha estiverem vazios', async () => {
		const onSignInWithEmailAndPassword = vi.fn();
		useAuthMock.mockReturnValue({
			onSignInWithEmailAndPassword,
			isLoading: false,
			loginWithGoogle: vi.fn(),
		});

		render(<LoginForm onLoginSuccess={vi.fn()} />);

		fireEvent.click(screen.getByRole('button', { name: 'ENTRAR' }));

		await waitFor(() => {
			expect(onSignInWithEmailAndPassword).not.toHaveBeenCalled();
		});
	});

	it('chama onLoginSuccess quando login por email retorna usuário', async () => {
		const password = randomPassword();
		const onLoginSuccess = vi.fn();
		const onSignInWithEmailAndPassword = vi.fn().mockResolvedValue({
			email: 'user@test.com',
		});

		useAuthMock.mockReturnValue({
			onSignInWithEmailAndPassword,
			isLoading: false,
			loginWithGoogle: vi.fn(),
		});

		render(<LoginForm onLoginSuccess={onLoginSuccess} />);

		fireEvent.change(screen.getByPlaceholderText('Digite seu email'), {
			target: { value: 'user@test.com' },
		});
		fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), {
			target: { value: password },
		});
		fireEvent.click(screen.getByRole('button', { name: 'ENTRAR' }));

		await waitFor(() => {
			expect(onSignInWithEmailAndPassword).toHaveBeenCalledWith(
				'user@test.com',
				password
			);
			expect(onLoginSuccess).toHaveBeenCalledTimes(1);
		});
	});

	it('mostra erro quando login por email retorna usuário inválido', async () => {
		const password = randomPassword();
		const onSignInWithEmailAndPassword = vi.fn().mockResolvedValue(null);

		useAuthMock.mockReturnValue({
			onSignInWithEmailAndPassword,
			isLoading: false,
			loginWithGoogle: vi.fn(),
		});

		render(<LoginForm onLoginSuccess={vi.fn()} />);

		fireEvent.change(screen.getByPlaceholderText('Digite seu email'), {
			target: { value: 'invalid@test.com' },
		});
		fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), {
			target: { value: password },
		});
		fireEvent.click(screen.getByRole('button', { name: 'ENTRAR' }));

		await waitFor(() => {
			expect(message.error).toHaveBeenCalledWith('Email ou senha inválidos');
		});
	});

	it('mostra erro quando login por email rejeita promise', async () => {
		const password = randomPassword();
		const onSignInWithEmailAndPassword = vi
			.fn()
			.mockRejectedValue(new Error('invalid credentials'));

		useAuthMock.mockReturnValue({
			onSignInWithEmailAndPassword,
			isLoading: false,
			loginWithGoogle: vi.fn(),
		});

		render(<LoginForm onLoginSuccess={vi.fn()} />);

		fireEvent.change(screen.getByPlaceholderText('Digite seu email'), {
			target: { value: 'invalid@test.com' },
		});
		fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), {
			target: { value: password },
		});
		fireEvent.click(screen.getByRole('button', { name: 'ENTRAR' }));

		await waitFor(() => {
			expect(message.error).toHaveBeenCalledWith('Email ou senha inválidos');
		});
	});

	it('faz login com Google e reseta formulário quando retorna email', async () => {
		const onLoginSuccess = vi.fn();
		const loginWithGoogle = vi.fn().mockResolvedValue({ email: 'g@test.com' });

		useAuthMock.mockReturnValue({
			onSignInWithEmailAndPassword: vi.fn(),
			isLoading: false,
			loginWithGoogle,
		});

		render(<LoginForm onLoginSuccess={onLoginSuccess} />);

		fireEvent.click(
			screen.getByRole('button', { name: /entrar com conta google/i })
		);

		await waitFor(() => {
			expect(loginWithGoogle).toHaveBeenCalledTimes(1);
			expect(onLoginSuccess).toHaveBeenCalledTimes(1);
			expect(resetFieldsMock).toHaveBeenCalledTimes(1);
		});
	});

	it('não navega nem reseta formulário quando login com Google retorna null', async () => {
		const onLoginSuccess = vi.fn();
		const loginWithGoogle = vi.fn().mockResolvedValue(null);

		useAuthMock.mockReturnValue({
			onSignInWithEmailAndPassword: vi.fn(),
			isLoading: false,
			loginWithGoogle,
		});

		render(<LoginForm onLoginSuccess={onLoginSuccess} />);

		fireEvent.click(
			screen.getByRole('button', { name: /entrar com conta google/i })
		);

		await waitFor(() => {
			expect(loginWithGoogle).toHaveBeenCalledTimes(1);
			expect(onLoginSuccess).not.toHaveBeenCalled();
			expect(resetFieldsMock).not.toHaveBeenCalled();
			expect(screen.getByTestId('spin')).toHaveAttribute(
				'data-spinning',
				'false'
			);
		});
	});

	it('abre o modal de recuperação de senha', async () => {
		useAuthMock.mockReturnValue({
			onSignInWithEmailAndPassword: vi.fn(),
			isLoading: false,
			loginWithGoogle: vi.fn(),
		});

		render(<LoginForm onLoginSuccess={vi.fn()} />);

		fireEvent.click(screen.getByRole('button', { name: /esqueci minha senha/i }));

		await waitFor(() => {
			expect(screen.getByTestId('modal')).toBeInTheDocument();
			expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
		});
	});
});
