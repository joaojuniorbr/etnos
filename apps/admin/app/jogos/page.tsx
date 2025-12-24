'use client';

import { useGames } from '@etnos/tools';
import { Breadcrumb, Spin, Table, Typography } from 'antd';
import Link from 'next/link';
import { useState } from 'react';

export default function EscolasPage() {
	const [isLoading] = useState(false);

	const { allGames } = useGames();

	return (
		<Spin spinning={isLoading}>
			<div className='container mx-auto py-4 px-6 md:py-10 md:px-0'>
				<Breadcrumb
					items={[
						{ title: 'Home', href: '/' },
						{
							title: 'Área do administrador',
							href: '/admin',
						},
						{
							title: 'Jogos',
						},
					]}
				/>

				<Typography.Title level={1} className='mb-10 mt-4'>
					Jogos
				</Typography.Title>

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
							title: 'Descrição',
							dataIndex: 'description',
							render: (description, record) => (
								<>
									<div className='text-sm mb-1'>{description}</div>
									<a
										href={record.url}
										target='_blank'
										rel='noreferrer'
										className='text-xs font-bold text-indigo-800 underline underline-offset-2 uppercase'
									>
										Jogar
									</a>
								</>
							),
						},
						{
							title: 'Slug',
							dataIndex: 'slug',
						},
						{
							title: 'URL',
							dataIndex: 'slug',
							render: (slug) => (
								<Link href={`/admin/jogos/${slug}`}>{slug}</Link>
							),
						},
					]}
					dataSource={allGames}
					pagination={false}
					rowKey='slug'
				/>
			</div>
		</Spin>
	);
}
