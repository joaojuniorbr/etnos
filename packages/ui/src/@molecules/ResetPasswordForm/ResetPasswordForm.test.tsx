import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResetPasswordForm } from './ResetPasswordForm';

const {
	apiPostMock,
	mutateMock,
	useMutationMock,
	messageSuccessMock,
	messageErrorMock,
	resetFieldsMock,
} = vi.hoisted(() => ({
	apiPostMock: vi.fn(),
	mutateMock: vi.fn(),
	useMutationMock: vi.fn(),
	messageSuccessMock: vi.fn(),
	messageErrorMock: vi.fn(),
	resetFieldsMock: vi.fn(),
}));

vi.mock('@etnos/tools', () => ({
	api: {
		post: apiPostMock,
	},
}));

vi.mock('@tanstack/react-query', () => ({
	useMutation: (options: unknown) => useMutationMock(options),
}));

vi.mock('../../@atoms', () => ({
	Button: ({
		children,
		htmlType,
		block: _block,
		loading: _loading,
		...props
	}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
		htmlType?: 'button' | 'submit' | 'reset';
		block?: boolean;
		loading?: boolean;
	}) => (
		<button type={htmlType ?? 'button'} {...props}>
			{children}
		</button>
	),
}));

vi.mock('antd', async () => {
	const React = await import('react');

	type FormProps = {
		children: React.ReactNode;
		onFinish?: (values: { email: string }) => void;
		disabled?: boolean;
	};

	type ItemProps = {
		children: React.ReactElement;
		name?: string;
	};

	const FormComponent = ({ children, onFinish }: FormProps) => (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				const formData = new FormData(event.currentTarget);
				const email = String(formData.get('email') ?? '');

				if (!email) return;

				onFinish?.({ email });
			}}
		>
			{children}
		</form>
	);

	const FormItem = ({ children, name }: ItemProps) => {
		if (!name) return <>{children}</>;

		return React.cloneElement(children, {
			name,
		} as React.InputHTMLAttributes<HTMLInputElement>);
	};

	const Form = Object.assign(FormComponent, {
		Item: FormItem,
		useForm: () => [
			{
				resetFields: resetFieldsMock,
			},
		],
	});

	return {
		Form,
		Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
			<input {...props} />
		),
		message: {
			success: messageSuccessMock,
			error: messageErrorMock,
		},
	};
});

describe('ResetPasswordForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		apiPostMock.mockResolvedValue({ data: true });
		useMutationMock.mockImplementation(({ mutationFn }) => ({
			isPending: false,
			mutate: mutateMock.mockImplementation(
				async (
					email: string,
					handlers?: {
						onSuccess?: () => void;
						onError?: () => void;
					}
				) => {
					try {
						await mutationFn(email);
						handlers?.onSuccess?.();
					} catch {
						handlers?.onError?.();
					}
				}
			),
		}));
	});

	it('envia email de recuperação com sucesso', async () => {
		const onSubmit = vi.fn();

		render(<ResetPasswordForm onSubmit={onSubmit} />);

		fireEvent.change(screen.getByPlaceholderText('Email'), {
			target: { value: 'aluno@teste.com' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'ENVIAR' }));

		await waitFor(() => {
			expect(apiPostMock).toHaveBeenCalledWith('/auth/recovery', {
				email: 'aluno@teste.com',
			});
		});

		expect(messageSuccessMock).toHaveBeenCalledWith(
			'E-mail de recuperação enviado!'
		);
		expect(onSubmit).toHaveBeenCalledTimes(1);
		expect(resetFieldsMock).toHaveBeenCalledTimes(1);
	});

	it('mostra mensagem de erro quando o envio falha', async () => {
		const onSubmit = vi.fn();
		apiPostMock.mockRejectedValueOnce(new Error('send failed'));

		render(<ResetPasswordForm onSubmit={onSubmit} />);

		fireEvent.change(screen.getByPlaceholderText('Email'), {
			target: { value: 'aluno@teste.com' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'ENVIAR' }));

		await waitFor(() => {
			expect(messageErrorMock).toHaveBeenCalledWith(
				'Ocorreu um erro ao enviar seu contato. Por favor, tente novamente mais tarde.'
			);
		});

		expect(onSubmit).not.toHaveBeenCalled();
		expect(resetFieldsMock).not.toHaveBeenCalled();
	});
});
