import { Breadcrumb, BreadcrumbProps } from 'antd';
import { Games, GameType } from '../../@molecules';

export type GamePageParams = {
	searchParams:
		| { [key: string]: string | undefined }
		| Promise<{ [key: string]: string | undefined }>;
};

type GameLayoutProps = {
	gameType: GameType;
	breadcrumbTitle: string;
	params: GamePageParams['searchParams'];
};

export const GameLayout = async ({
	gameType,
	breadcrumbTitle,
	params,
}: GameLayoutProps) => {
	const resolvedParams = params instanceof Promise ? await params : params;
	const character = resolvedParams?.personagem;

	const breadcrumbItems: BreadcrumbProps['items'] = [
		{ title: 'Home', href: '/' },
		{ title: 'Área do estudante', href: '/estudante' },
		{ title: 'Jogos', href: '/estudante/jogos' },
		{ title: breadcrumbTitle },
	];

	return (
		<div className='container mx-auto py-4 px-6 md:py-10 md:px-0'>
			<Breadcrumb items={breadcrumbItems} />

			<div className='md:p-4 md:bg-white md:border md:border-slate-200 md:shadow md:rounded mt-6 mb-10'>
				<Games type={gameType} characterSlug={character} />
			</div>
		</div>
	);
};
