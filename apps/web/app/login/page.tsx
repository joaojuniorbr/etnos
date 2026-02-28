'use client';

import Image from 'next/image';

import { useRandomCharacter } from '@etnos/hooks';
import { LoginForm } from '@etnos/ui';

export default function LoginPage() {
	const { character } = useRandomCharacter();

	const onLoginSuccess = () => {
		window.open('/estudante', '_self');
	};

	return (
		<div className='p-0 pb-1 md:p-8'>
			<div className='container mx-auto'>
				<div className='flex flex-col w-full rounded bg-white md:flex-row'>
					<Image
						src={`${character?.featureImageUrl}`}
						alt={`${character?.name}`}
						width={800}
						height={800}
						className='object-cover object-center w-full md:w-1/2 md:order-2 md:rounded-tr md:rounded-br'
					/>

					<div className='p-8 flex flex-col justify-center md:w-1/2'>
						<div className='max-w-md mx-auto w-full'>
							<LoginForm onLoginSuccess={onLoginSuccess} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
