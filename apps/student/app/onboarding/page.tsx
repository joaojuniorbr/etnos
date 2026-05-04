'use client';

import { api, useAuth } from '@etnos/tools';
import { useQuery } from '@tanstack/react-query';
import { Button, Form, Image, Input, message, Select, Spin } from 'antd';

type SchoolPublic = { id: string; name: string; code?: string | null };

export default function StudentOnboardingPage() {
	const { updateUserProfile, user, isProfileLoading } = useAuth();
	const [form] = Form.useForm<{ school: string; childName: string }>();

	const { data: schools, isLoading: isLoadingSchools } = useQuery({
		queryKey: ['schools', 'public'],
		queryFn: () =>
			api.get<SchoolPublic[]>('/public/schools').then((res) => res.data),
	});

	const onFinish = async (values: { school: string; childName: string }) => {
		const response = await updateUserProfile({
			school: values.school,
			childName: values.childName.trim(),
		});

		if (response?.school) {
			globalThis.window.location.href = '/estudante';
		} else {
			message.error('Salvar escola falhou. Tente novamente.');
		}
	};

	if (isProfileLoading || !user) {
		return (
			<div className="flex min-h-[40vh] w-full items-center justify-center">
				<Spin size="large" />
			</div>
		);
	}

	return (
		<Spin spinning={isLoadingSchools}>
			<div className="flex items-center justify-center flex-1">
				<div className="container mx-auto py-4 px-6 md:py-10 md:px-0">
					<div className="p-4 bg-white border border-slate-200 shadow rounded max-w-lg mx-auto md:p-10">
						<div className="mb-6 flex flex-col gap-2">
							<Image
								preview={false}
								src="/estudante/persona-sign-in.jpg"
								className="w-full h-auto"
							/>
							<h2 className="text-2xl font-black text-primary">
								Complete o cadastro
							</h2>
							<p className="text-sm">
								Para acessar os jogos, informe a escola que você frequentará e o
								nome da criança que usará a conta.
							</p>
						</div>

						<Form
							form={form}
							layout="vertical"
							onFinish={onFinish}
							requiredMark
							disabled={isLoadingSchools}
							initialValues={{
								childName: user.childName ?? '',
							}}
						>
							<Form.Item
								name="school"
								label="Escola"
								rules={[{ required: true, message: 'Selecione a escola' }]}
							>
								<Select
									placeholder="Selecione a escola"
									options={schools?.map((s) => ({
										value: s.id,
										label: s.name,
									}))}
								/>
							</Form.Item>

							<Form.Item
								name="childName"
								label="Nome da criança"
								rules={[
									{ required: true, message: 'Informe o nome da criança' },
								]}
							>
								<Input placeholder="Nome completo da criança" />
							</Form.Item>

							<Button
								type="primary"
								htmlType="submit"
								block
								size="large"
								disabled={isLoadingSchools}
								loading={isLoadingSchools}
							>
								Salvar e continuar
							</Button>
						</Form>
					</div>
				</div>
			</div>
		</Spin>
	);
}
