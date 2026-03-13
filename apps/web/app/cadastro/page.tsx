'use client';

import Image from 'next/image';
import { api, signImage } from '@etnos/common';
import { SignUpForm } from '@etnos/ui';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export default function CadastroPage() {
	const router = useRouter();

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
							onRegisterSuccess={() => router.push('/estudante')}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
