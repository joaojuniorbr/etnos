'use client';

import { Button, Divider, Form, Input, message, Select } from 'antd';
import Image from 'next/image';
import { signImage } from '@etnos/common';
import { useAuth } from '@etnos/tools';

export default function CadastroPage() {
	const { onRegister, isLoading } = useAuth();

	const onFinish = async (values: any) => {
		onRegister(values).then((user) => {
			if (user) {
				message.success('Cadastro realizado com sucesso');
				window.open('/estudante', '_self');
			} else {
				message.error('Erro ao realizar o cadastro');
			}
		});
	};

	return (
		<div className='p-0 pb-1 md:p-8'>
			<div className='container mx-auto'>
				<div className='flex flex-col w-full rounded bg-white md:flex-row'>
					<Image
						src={`${signImage?.url}`}
						alt={`${signImage?.name}`}
						width={800}
						height={800}
						className='object-cover object-center w-full md:w-1/2 md:order-2 md:rounded-tr md:rounded-br'
					/>

					<div className='p-8 md:w-1/2'>
						<h1 className='text-xl uppercase font-bold text-primary mb-2'>
							Cadastre-se para começar a jogar
						</h1>

						<p className='text-slate-600 mb-10'>
							Participe gratuitamente do Etnos e tenha acesso a jogos educativos
							que valorizam a diversidade cultural e promovem o respeito às
							diferenças.
						</p>

						<Form layout='vertical' onFinish={onFinish} disabled={isLoading}>
							<Form.Item name='school' label='Escola'>
								<Select placeholder='Selecione a escola' options={[]} />
							</Form.Item>

							<Divider />

							<Form.Item
								name='parentName'
								rules={[{ required: true }]}
								label='Nome Pai/Mãe'
							>
								<Input placeholder='Digite o nome completo' />
							</Form.Item>

							<Form.Item
								name='parentEmail'
								rules={[{ required: true }]}
								label='Email Pai/Mãe'
							>
								<Input placeholder='Digite o email' />
							</Form.Item>

							<Form.Item name='parentPhone' label='Telefone Pai/Mãe'>
								<Input placeholder='Digite o telefone' />
							</Form.Item>

							<Divider />

							<Form.Item
								name='childName'
								rules={[{ required: true }]}
								label='Nome da Criança'
							>
								<Input placeholder='Digite o nome da criança' />
							</Form.Item>

							<Form.Item
								name='childBirthDate'
								label='Data de Nascimento da Criança'
								rules={[{ required: true }]}
							>
								<Input placeholder='Digite a data de nascimento da criança' />
							</Form.Item>

							<Divider />

							<div className='flex gap-4 w-full'>
								<Form.Item
									name='password'
									rules={[{ required: true }]}
									label='Senha'
									className='w-full'
								>
									<Input.Password placeholder='Digite sua senha' />
								</Form.Item>
								<Form.Item
									name='confirmPassword'
									rules={[{ required: true }]}
									label='Confirmar Senha'
									className='w-full'
								>
									<Input.Password placeholder='Digite sua senha' />
								</Form.Item>
							</div>

							<div className='pt-4'>
								<Button
									block
									type='primary'
									htmlType='submit'
									disabled={isLoading}
									loading={isLoading}
								>
									CADASTRAR
								</Button>
							</div>
						</Form>
					</div>
				</div>
			</div>
		</div>
	);
}
