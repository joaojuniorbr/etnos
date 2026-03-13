'use client';

import Image from 'next/image';
import { api, signImage } from '@etnos/common';
import { SignUpForm } from '@etnos/ui';
import { useAuth } from '@etnos/tools';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Spin } from 'antd';

export default function CadastroPage() {
	const { user, isProfileLoading } = useAuth();

	const onRegisterSuccess = () => {
		window.open('/estudante', '_self');
	};

	useEffect(() => {
		if (user?.email) {
			onRegisterSuccess();
		}
	}, [user]);

	const { data: schools, isLoading: isLoadingSchool } = useQuery({
		queryKey: ['schools', 'public'],
		queryFn: () =>
			api
				.get<
					{
						id: string;
						name: string;
					}[]
				>('/public/schools')
				.then((res) => res.data),
	});

	return (
		<Spin spinning={isProfileLoading} size='large'>
			<div className='p-6 md:p-8'>
				<div className='container mx-auto'>
					<div className='flex flex-col w-full rounded bg-white shadow md:flex-row '>
						{signImage && (
							<Image
								src={signImage?.url}
								alt={signImage?.name}
								width={800}
								height={800}
								className='object-cover object-center w-1/2 order-2 rounded-tr rounded-br hidden lg:block'
								suppressHydrationWarning
							/>
						)}
						<div className='p-6 md:p-8 lg:w-1/2'>
							<SignUpForm
								schools={schools}
								isLoadingSchools={isLoadingSchool}
								onRegisterSuccess={onRegisterSuccess}
							/>
						</div>
					</div>
				</div>
			</div>
		</Spin>
	);
}
