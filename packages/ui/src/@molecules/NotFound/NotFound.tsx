'use client';

import Image from 'next/image';
import { Button } from '../../@atoms';
import { useUser } from '../../context';

export const NotFound = () => {
	const { user } = useUser();

	return (
		<div className="ui:flex ui:flex-1 ui:flex-col ui:items-center ui:justify-center ui:bg-white ui:px-6 ui:py-20">
			<div>
				<Image
					src="/images/404.png"
					alt="Página não encontrada"
					width={600}
					height={600}
				/>

				<nav className="ui:flex ui:flex-row ui:gap-4 ui:justify-center ui:mt-6 ui:uppercase">
					<Button type="secondary" size="large" className="uppercase">
						Voltar para o início
					</Button>

					{user ? (
						<Button type="secondary" size="large" href="/estudante">
							Entrar
						</Button>
					) : (
						<Button type="secondary" size="large" href="/login">
							Login
						</Button>
					)}
				</nav>
			</div>
		</div>
	);
};
