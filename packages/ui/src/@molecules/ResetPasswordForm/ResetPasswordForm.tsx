import { Form, Input, message } from 'antd';
import { Button } from '../../@atoms';
import { useMutation } from '@tanstack/react-query';
import { api } from '@etnos/tools';

interface ResetPasswordFormProps {
	onSubmit: () => void;
}

export const ResetPasswordForm = ({ onSubmit }: ResetPasswordFormProps) => {
	const [form] = Form.useForm();

	const { mutate, isPending } = useMutation({
		mutationFn: async (email: string) =>
			api.post('/auth/recovery', { email }).then((res) => res.data),
	});

	const onFinish = async (values: { email: string }) => {
		mutate(values.email, {
			onSuccess: () => {
				message.success('E-mail de recuperação enviado!');
				onSubmit();
				form.resetFields();
			},
			onError: () => {
				message.error(
					'Ocorreu um erro ao enviar seu contato. Por favor, tente novamente mais tarde.'
				);
			},
		});
	};

	return (
		<div className='ui:py-2'>
			<h2 className='ui:text-xl ui:font-black ui:uppercase'>Recuperar senha</h2>
			<p className='ui:text-base ui:mb-8 ui:mt-3'>
				Insira o e-mail para recuperar a sua senha. Se você não receber o
				e-mail, verifique sua caixa de spam.
			</p>

			<Form
				layout='vertical'
				size='large'
				form={form}
				onFinish={onFinish}
				disabled={isPending}
			>
				<Form.Item name='email' rules={[{ required: true }, { type: 'email' }]}>
					<Input placeholder='Email' type='email' />
				</Form.Item>

				<Form.Item>
					<Button htmlType='submit' block type='secondary' loading={isPending}>
						ENVIAR
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
};
