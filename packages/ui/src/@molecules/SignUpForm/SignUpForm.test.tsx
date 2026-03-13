import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { message } from 'antd';
import { SignUpForm } from './SignUpForm';

const resetFieldsMock = vi.fn();
const setFieldValueMock = vi.fn();
const useAuthMock = vi.fn();
const formatPhoneBRMock = vi.fn((value: string) => value);
let confirmPasswordRulesMock: unknown[] = [];

vi.mock('@etnos/tools', () => ({
	useAuth: () => useAuthMock(),
	formatPhoneBR: (value: string) => formatPhoneBRMock(value),
}));

vi.mock('../../@atoms', () => ({
	Button: ({
		children,
		htmlType,
		...props
	}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
		htmlType?: 'button' | 'submit' | 'reset';
	}) => {
		return (
			<button type={htmlType ?? 'button'} {...props}>
				{children}
			</button>
		);
	},
}));

vi.mock('antd', async () => {
	const React = await import('react');

	type RegisterValues = {
		school?: string;
		parentName: string;
		parentEmail: string;
		parentPhone?: string;
		childName: string;
		childBirthDate: { format: (pattern?: string) => string };
		password: string;
		confirmPassword: string;
	};

	type FormProps = {
		children: React.ReactNode;
		onFinish?: (values: RegisterValues) => void;
	};

	type ItemProps = {
		children: React.ReactElement;
		label?: string;
		name?: string;
		rules?: unknown[];
	};

	const FormComponent = ({ children, onFinish }: FormProps) => {
		return (
			<form
				onSubmit={(event) => {
					event.preventDefault();
					const formData = new FormData(event.currentTarget);

					const values: RegisterValues = {
						school: String(formData.get('school') ?? ''),
						parentName: String(formData.get('parentName') ?? ''),
						parentEmail: String(formData.get('parentEmail') ?? ''),
						parentPhone: String(formData.get('parentPhone') ?? ''),
						childName: String(formData.get('childName') ?? ''),
						childBirthDate: {
							format: () => String(formData.get('childBirthDate') ?? ''),
						},
						password: String(formData.get('password') ?? ''),
						confirmPassword: String(formData.get('confirmPassword') ?? ''),
					};

					if (
						!values.parentName ||
						!values.parentEmail ||
						!values.childName ||
						!values.childBirthDate.format('YYYY-MM-DD') ||
						!values.password ||
						!values.confirmPassword
					) {
						return;
					}

					onFinish?.(values);
				}}
			>
				{children}
			</form>
		);
	};

	const FormItem = ({ children, label, name, rules }: ItemProps) => {
		if (!name) return <>{children}</>;
		if (name === 'confirmPassword') {
			confirmPasswordRulesMock = rules ?? [];
		}

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
		useForm: () => [
			{
				resetFields: resetFieldsMock,
				setFieldValue: setFieldValueMock,
				getFieldValue: vi.fn(),
			},
		],
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
		DatePicker: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
			<input type='date' {...props} />
		),
		Divider: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
		Form,
		Input,
		Select: ({
			options,
			...props
		}: React.SelectHTMLAttributes<HTMLSelectElement> & {
			options?: { value: string; label: string }[];
		}) => (
			<select {...props}>
				<option value=''>Selecione</option>
				{options?.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		),
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
			success: vi.fn(),
		},
	};
});

describe('SignUpForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetFieldsMock.mockClear();
		setFieldValueMock.mockClear();
		confirmPasswordRulesMock = [];
	});

	it('chama onRegister com os dados do formulario e executa sucesso', async () => {
		const onRegisterSuccess = vi.fn();
		const onRegister = vi.fn().mockResolvedValue({ uid: 'user-1' });

		useAuthMock.mockReturnValue({
			onRegister,
			isLoading: false,
		});

		render(
			<SignUpForm
				schools={[{ id: 'school-1', name: 'Escola Teste' }]}
				onRegisterSuccess={onRegisterSuccess}
			/>
		);

		fireEvent.change(screen.getByLabelText('Escola'), {
			target: { value: 'school-1' },
		});
		fireEvent.change(screen.getByPlaceholderText('Digite o nome completo'), {
			target: { value: 'Maria' },
		});
		fireEvent.change(screen.getByPlaceholderText('Digite o email'), {
			target: { value: 'maria@email.com' },
		});
		fireEvent.change(screen.getByPlaceholderText('Digite o telefone'), {
			target: { value: '(41) 99999-1234' },
		});
		fireEvent.change(screen.getByPlaceholderText('Digite o nome da criança'), {
			target: { value: 'Joao' },
		});
		fireEvent.change(screen.getByLabelText('Data de Nascimento da Criança'), {
			target: { value: '2020-05-10' },
		});

		const passwordInputs = screen.getAllByPlaceholderText('Digite sua senha');
		const passwordInput = passwordInputs[0]!;
		const confirmPasswordInput = passwordInputs[1]!;
		fireEvent.change(passwordInput, {
			target: { value: '123456' },
		});
		fireEvent.change(confirmPasswordInput, {
			target: { value: '123456' },
		});

		fireEvent.click(screen.getByRole('button', { name: 'CADASTRAR' }));

		await waitFor(() => {
			expect(onRegister).toHaveBeenCalledWith({
				school: 'school-1',
				parentName: 'Maria',
				parentEmail: 'maria@email.com',
				parentPhone: '(41) 99999-1234',
				childName: 'Joao',
				childBirthDate: '2020-05-10',
				password: '123456',
				confirmPassword: '123456',
			});
			expect(message.success).toHaveBeenCalledWith(
				'Cadastro realizado com sucesso'
			);
			expect(resetFieldsMock).toHaveBeenCalledTimes(1);
			expect(onRegisterSuccess).toHaveBeenCalledTimes(1);
		});
	});

	it('nao executa sucesso quando o registro retorna nulo', async () => {
		const onRegisterSuccess = vi.fn();
		const onRegister = vi.fn().mockResolvedValue(null);

		useAuthMock.mockReturnValue({
			onRegister,
			isLoading: false,
		});

		render(<SignUpForm onRegisterSuccess={onRegisterSuccess} />);

		fireEvent.change(screen.getByPlaceholderText('Digite o nome completo'), {
			target: { value: 'Maria' },
		});
		fireEvent.change(screen.getByPlaceholderText('Digite o email'), {
			target: { value: 'maria@email.com' },
		});
		fireEvent.change(screen.getByPlaceholderText('Digite o nome da criança'), {
			target: { value: 'Joao' },
		});
		fireEvent.change(screen.getByLabelText('Data de Nascimento da Criança'), {
			target: { value: '2020-05-10' },
		});

		const passwordInputs = screen.getAllByPlaceholderText('Digite sua senha');
		const passwordInput = passwordInputs[0]!;
		const confirmPasswordInput = passwordInputs[1]!;
		fireEvent.change(passwordInput, {
			target: { value: '123456' },
		});
		fireEvent.change(confirmPasswordInput, {
			target: { value: '123456' },
		});

		fireEvent.click(screen.getByRole('button', { name: 'CADASTRAR' }));

		await waitFor(() => {
			expect(onRegister).toHaveBeenCalledTimes(1);
			expect(onRegisterSuccess).not.toHaveBeenCalled();
			expect(message.success).not.toHaveBeenCalled();
		});
	});

	it('mantem o spinner ativo durante o carregamento', () => {
		useAuthMock.mockReturnValue({
			onRegister: vi.fn(),
			isLoading: true,
		});

		render(<SignUpForm isLoadingSchools={false} onRegisterSuccess={vi.fn()} />);

		expect(screen.getByTestId('spin')).toHaveAttribute('data-spinning', 'true');
	});

	it('valida confirmacao de senha com sucesso e erro', async () => {
		useAuthMock.mockReturnValue({
			onRegister: vi.fn(),
			isLoading: false,
		});

		render(<SignUpForm onRegisterSuccess={vi.fn()} />);

		const validatorFactory = confirmPasswordRulesMock[1] as (params: {
			getFieldValue: (field: string) => string;
		}) => {
			validator: (_: unknown, value: string) => Promise<void>;
		};

		const matchingValidator = validatorFactory({
			getFieldValue: () => '123456',
		}).validator;

		await expect(matchingValidator(null, '123456')).resolves.toBeUndefined();
		await expect(matchingValidator(null, '')).resolves.toBeUndefined();

		const invalidValidator = validatorFactory({
			getFieldValue: () => '123456',
		}).validator;

		await expect(invalidValidator(null, '654321')).rejects.toThrow(
			'As senhas não coincidem'
		);
	});
});
