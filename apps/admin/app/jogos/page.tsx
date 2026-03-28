'use client';

import { useGames } from '@etnos/tools';
import { Breadcrumb, Button, Spin, Tag } from 'antd';
import { useState } from 'react';
import { gameManagementLinks } from '../admin-navigation';
import { AuthProtected, Title } from '@etnos/ui';

export default function JogosPage() {
	const [isLoading] = useState(false);
	const { allGames } = useGames();

	return (
		<AuthProtected allowedRoles={['admin']} forbiddenRedirectTo='/admin/escolas'>
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

					<Title className='mb-4 mt-6'>Jogos</Title>
					<p className='text-slate-600'>
						Veja os jogos cadastrados, abra a experiencia do aluno e entre direto
						nas rotas de gestao ja disponiveis no admin.
					</p>

					<div className='mt-6 grid gap-4 md:grid-cols-2 mb-4'>
						{allGames.map((game) => {
							const management = gameManagementLinks[game.slug];

							return (
								<div
									key={game.slug}
									className='rounded border border-slate-200 shadow-sm bg-white p-6'
								>
									<div className='flex flex-wrap items-start justify-between gap-3 mb-4'>
										<div>
											<Title>{game.name}</Title>
											<p className='text-slate-600 text-xs'>{game.slug}</p>
										</div>

										<Tag color={management?.available ? 'green' : 'default'}>
											{management?.available ? 'Gestao disponivel' : 'Sem painel'}
										</Tag>
									</div>

									<p className='text-slate-600 text-base mb-4'>
										{game.description}
									</p>

									<div className='flex flex-wrap gap-3'>
										<Button href={game.url} target='_blank'>
											Abrir jogo
										</Button>

										{management?.available && management.href ? (
											<Button type='primary' href={management.href}>
												{management.label}
											</Button>
										) : (
											<Button disabled>
												{management?.label ?? 'Gestao indisponivel'}
											</Button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</Spin>
		</AuthProtected>
	);
}
