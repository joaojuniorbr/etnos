'use client';

import { useGames } from '@etnos/tools';
import { Breadcrumb, Button, Card, Spin, Table, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { gameManagementLinks } from '../admin-navigation';

export default function JogosPage() {
	const [isLoading] = useState(false);
	const { allGames } = useGames();

	return (
		<Spin spinning={isLoading}>
			<div className='container mx-auto py-4 px-6 md:py-10 md:px-0'>
				<Breadcrumb
					items={[
						{ title: 'Home', href: '/' },
						{
							title: 'Area do administrador',
							href: '/admin',
						},
						{
							title: 'Jogos',
						},
					]}
				/>

				<div className='mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
					<Typography.Title level={1} className='!mb-2'>
						Jogos
					</Typography.Title>
					<Typography.Paragraph className='!mb-0 !max-w-3xl !text-slate-600'>
						Veja os jogos cadastrados, abra a experiencia do aluno e entre
						direto nas rotas de gestao ja disponiveis no admin.
					</Typography.Paragraph>
				</div>

				<div className='mt-6 grid gap-4 md:grid-cols-2'>
					{allGames.map((game) => {
						const management = gameManagementLinks[game.slug];

						return (
							<Card
								key={game.slug}
								className='rounded-2xl border border-slate-200 shadow-sm'
							>
								<div className='flex flex-wrap items-start justify-between gap-3'>
									<div>
										<Typography.Title level={4} className='!mb-1'>
											{game.name}
										</Typography.Title>
										<Typography.Text type='secondary'>{game.slug}</Typography.Text>
									</div>
									<Tag color={management?.available ? 'green' : 'default'}>
										{management?.available ? 'Gestao disponivel' : 'Sem painel'}
									</Tag>
								</div>

								<Typography.Paragraph className='!mt-4 !mb-5 !text-slate-600'>
									{game.description}
								</Typography.Paragraph>

								<div className='flex flex-wrap gap-3'>
									<Button href={game.url} target='_blank'>
										Abrir jogo
									</Button>

									{management?.available && management.href ? (
										<Button type='primary' href={management.href}>
											{management.label}
										</Button>
									) : (
										<Button disabled>{management?.label ?? 'Gestao indisponivel'}</Button>
									)}
								</div>
							</Card>
						);
					})}
				</div>

				<div className='mt-8 rounded-2xl bg-white p-4 shadow-sm'>
					<Table
						columns={[
							{
								title: 'Nome',
								dataIndex: 'name',
								render: (name) => (
									<span className='text-base font-bold text-primary'>{name}</span>
								),
							},
							{
								title: 'Descricao',
								dataIndex: 'description',
								render: (description) => (
									<div className='text-sm text-slate-600'>{description}</div>
								),
							},
							{
								title: 'Slug',
								dataIndex: 'slug',
							},
							{
								title: 'Gestao',
								dataIndex: 'slug',
								render: (slug) => {
									const management = gameManagementLinks[slug];

									if (!management?.available || !management.href) {
										return <Tag>Em breve</Tag>;
									}

									return <Link href={management.href}>{management.label}</Link>;
								},
							},
						]}
						dataSource={allGames}
						pagination={false}
						rowKey='slug'
					/>
				</div>
			</div>
		</Spin>
	);
}
