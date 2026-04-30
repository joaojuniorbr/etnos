'use client';

import { Breadcrumb, Tag } from 'antd';
import Link from 'next/link';
import {
	adminSections,
	gameHighlights,
	schoolSections,
} from './admin-navigation';
import { Card, Title } from '@etnos/ui';
import { schoolService, useAuth } from '@etnos/tools';
import { useEffect, useState } from 'react';
import {
	GameNameEnum,
	GamesEnum,
	type SchoolRankingInterface,
} from '@etnos/types';
import { SchoolsRanking } from '@etnos/components';

const gameOptions = [
	{
		value: 'all',
		label: 'Todos os jogos',
	},
	...Object.values(GamesEnum).map((gameSlug) => ({
		value: gameSlug,
		label: GameNameEnum[gameSlug],
	})),
];

export default function Page() {
	const { user } = useAuth();
	const isAdmin = user?.role?.includes('admin');
	const sections = isAdmin ? adminSections : schoolSections;
	const [selectedGame, setSelectedGame] = useState<string>('all');
	const [schoolRanking, setSchoolRanking] = useState<SchoolRankingInterface[]>(
		[],
	);

	useEffect(() => {
		if (!isAdmin) {
			return;
		}

		schoolService
			.getRanking(selectedGame === 'all' ? undefined : selectedGame)
			.then((ranking) => {
				setSchoolRanking(ranking);
			});
	}, [isAdmin, selectedGame]);

	return (
		<div className="min-h-screen bg-slate-50">
			<div className="container mx-auto px-6 py-4 md:py-10">
				<Breadcrumb
					items={[
						{ title: 'Home', href: '/' },
						{
							title: 'Área do administrador',
						},
					]}
				/>

				<section className="pt-6 md:pt-8">
					<Title>Modulos</Title>
					<p className="text-sm text-slate-600 mb-6">
						{isAdmin
							? 'Atalhos para as areas mais usadas no dia a dia da equipe.'
							: 'Acesso rápido ao painel da sua escola.'}
					</p>

					<div className="grid md:grid-cols-4 gap-4">
						{sections.map((section) => (
							<Card key={section.href}>
								<div className="text-base font-bold uppercase">
									{section.title}
								</div>

								<p className="text-slate-600 text-sm mb-4">
									{section.description}
								</p>
								<Link href={section.href}>
									<span className="font-bold text-xs px-2 py-1 bg-primary text-white rounded">
										{section.cta}
									</span>
								</Link>
							</Card>
						))}
					</div>
				</section>

				{isAdmin ? (
					<>
						<section className="pt-12">
							<SchoolsRanking
								ranking={schoolRanking}
								selectedGame={selectedGame}
								onGameChange={setSelectedGame}
								gameOptions={gameOptions}
							/>
						</section>

						<section className="pt-12">
							<Title>Gestão de jogos</Title>
							<p className="text-sm text-slate-600 mb-6">
								Links diretos para os jogos que ja contam com tela de
								administração.
							</p>

							<div className="grid md:grid-cols-2 gap-4">
								{gameHighlights.map((game) => (
									<Card key={game.href}>
										<div>
											<Tag color="green" className="mb-3">
												Disponível agora
											</Tag>
											<span className="block text-lg font-black uppercase text-primary">
												{game.name}
											</span>
										</div>
										<div>
											<p className="pt-1 pb-2">{game.description}</p>

											<Link href={game.href}>
												<span className="underline underline-offset-1 text-primary">
													{game.cta}
												</span>
											</Link>
										</div>
									</Card>
								))}
							</div>
						</section>
					</>
				) : null}
			</div>
		</div>
	);
}
