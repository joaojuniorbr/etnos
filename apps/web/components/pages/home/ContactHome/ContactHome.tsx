'use client';

import { useMutation } from '@tanstack/react-query';
import { Form, message, Spin } from 'antd';
import { api } from 'common/api';
import { formatPhoneBR, normalizePhone } from '@etnos/tools';

type ContactForm = {
	phone: string;
};

export const ContactHome = () => {
	const { mutate, isPending } = useMutation({
		mutationFn: async (phone: string) =>
			api.post('/public/contact', { phone }).then((res) => res.data),
	});
	const [form] = Form.useForm<ContactForm>();

	const handleSubmit = async (values: ContactForm) => {
		const phone = normalizePhone(values.phone);

		mutate(phone, {
			onSuccess: () => {
				form.resetFields();
				message.success(
					'Contato enviado com sucesso! Entraremos em contato em breve.',
				);
			},
			onError: () => {
				message.error(
					'Ocorreu um erro ao enviar seu contato. Por favor, tente novamente mais tarde.',
				);
			},
		});
	};

	return (
		<Spin spinning={isPending}>
			<section className="p-6 py-10 md:py-16 lg:py-20 bg-[#211903] text-white text-center">
				<div className="mx-auto max-w-lg">
					<h2 className="text-xl font-bold mb-2 md:text-4xl md:mb-4 text-center">
						Ficou com alguma dúvida?
					</h2>

					<p className="font-extralight text-sm mb-8 md:mb-10 md:text-lg">
						Estamos aqui para ajudar! Deixe seu número e fale com nossa equipe
						sobre o projeto, os jogos ou como começar a usar o Etnos na sua
						escola.
					</p>

					<Form form={form} className="flex" onFinish={handleSubmit}>
						<div className="flex-1">
							<Form.Item
								noStyle
								name="phone"
								rules={[
									{
										required: true,
										message: 'Informe seu telefone.',
									},
									{
										validator: (_, value: string) => {
											const normalizedPhone = normalizePhone(value ?? '');

											if (
												normalizedPhone.length === 10 ||
												normalizedPhone.length === 11
											) {
												return Promise.resolve();
											}

											return Promise.reject(
												new Error('Digite um telefone válido com DDD.'),
											);
										},
									},
								]}
							>
								<input
									type="tel"
									placeholder="Digite seu telefone"
									maxLength={15}
									className="w-full text-white bg-white/5 rounded-tl-lg rounded-bl-lg p-4 text-base lg:text-lg"
									onChange={(event) => {
										form.setFieldValue(
											'phone',
											formatPhoneBR(event.target.value),
										);
									}}
								/>
							</Form.Item>
						</div>

						<button
							type="submit"
							disabled={isPending}
							className="bg-secondary text-white py-3 px-6 rounded-br-lg rounded-tr-lg font-normal uppercase cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
						>
							{isPending ? 'Enviando...' : 'Enviar'}
						</button>
					</Form>
				</div>
			</section>
		</Spin>
	);
};
