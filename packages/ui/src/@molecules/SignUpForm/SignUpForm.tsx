import { formatPhoneBR, useAuth } from '@etnos/tools';
import { DatePicker, Divider, Form, Input, message, Select, Spin } from 'antd';
import { Button } from '../../@atoms';

interface SchoolOption {
	id: string;
	name: string;
}

interface RegisterFormValues {
	childBirthDate: { format: (pattern: string) => string };
	childName: string;
	parentEmail: string;
	parentName: string;
	parentPhone?: string;
	password: string;
	confirmPassword: string;
	school?: string;
}

interface SignUpFormProps {
	schools?: SchoolOption[];
	isLoadingSchools?: boolean;
	onRegisterSuccess: () => void;
}

export const SignUpForm = ({
	schools,
	isLoadingSchools = false,
	onRegisterSuccess,
}: SignUpFormProps) => {
	const [form] = Form.useForm<RegisterFormValues>();
	const { onRegister, isLoading } = useAuth();

	const onFinish = async (values: RegisterFormValues) => {
		const user = await onRegister({
			...values,
			childBirthDate: values.childBirthDate.format('YYYY-MM-DD'),
		});

		if (user) {
			message.success('Cadastro realizado com sucesso');
			form.resetFields();
			onRegisterSuccess();
		}
	};

	return (
		<Spin spinning={isLoading || isLoadingSchools}>
			<div className="ui:flex ui:flex-col ui:justify-center ui:gap-6">
				<h1 className="ui:text-xl ui:uppercase ui:font-bold ui:text-primary">
					Cadastre-se para começar a jogar
				</h1>

				<p className="ui:text-slate-600 ui:text-sm ui:md:text-base">
					Participe gratuitamente do Etnos e tenha acesso a jogos educativos que
					valorizam a diversidade cultural e promovem o respeito às diferenças.
				</p>

				<Form
					form={form}
					layout="vertical"
					onFinish={onFinish}
					disabled={isLoading || isLoadingSchools}
				>
					<Form.Item name="school" label="Escola">
						<Select
							placeholder="Selecione a escola"
							options={schools?.map((school) => ({
								value: school.id,
								label: school.name,
							}))}
						/>
					</Form.Item>

					<Divider />

					<Form.Item
						name="parentName"
						rules={[{ required: true }]}
						label="Nome Pai/Mãe"
					>
						<Input placeholder="Digite o nome completo" />
					</Form.Item>

					<Form.Item
						name="parentEmail"
						rules={[{ required: true }]}
						label="Email Pai/Mãe"
					>
						<Input placeholder="Digite o email" />
					</Form.Item>

					<Form.Item name="parentPhone" label="Telefone Pai/Mãe">
						<Input
							type="tel"
							maxLength={15}
							placeholder="Digite o telefone"
							onChange={(event) => {
								form.setFieldValue(
									'parentPhone',
									formatPhoneBR(event.target.value),
								);
							}}
						/>
					</Form.Item>

					<Divider />

					<Form.Item
						name="childName"
						rules={[{ required: true }]}
						label="Nome da Criança"
					>
						<Input placeholder="Digite o nome da criança" />
					</Form.Item>

					<Form.Item
						name="childBirthDate"
						label="Data de Nascimento da Criança"
						rules={[{ required: true }]}
					>
						<DatePicker format="DD/MM/YYYY" className="ui:w-full" />
					</Form.Item>

					<Divider />

					<div className="ui:grid ui:grid-cols-1 ui:md:grid-cols-2 ui:md:gap-4 ui:w-full">
						<Form.Item
							name="password"
							rules={[{ required: true }]}
							label="Senha"
							className="ui:w-full"
						>
							<Input.Password placeholder="Digite sua senha" />
						</Form.Item>

						<Form.Item
							name="confirmPassword"
							dependencies={['password']}
							rules={[
								{ required: true },
								({ getFieldValue }) => ({
									validator(_, value) {
										if (!value || getFieldValue('password') === value) {
											return Promise.resolve();
										}

										return Promise.reject(new Error('As senhas não coincidem'));
									},
								}),
							]}
							label="Confirmar Senha"
							className="ui:w-full"
						>
							<Input.Password placeholder="Digite sua senha" />
						</Form.Item>
					</div>

					<div className="ui:pt-4">
						<Button
							block
							type="secondary"
							htmlType="submit"
							disabled={isLoading || isLoadingSchools}
						>
							CADASTRAR
						</Button>
					</div>
				</Form>
			</div>
		</Spin>
	);
};
