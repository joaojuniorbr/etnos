'use client';

import Link from 'next/link';
import {
	GameUrlEnum,
	CharacterInterface,
	StudentDashboardInterface,
} from '@etnos/types';

import { Button, Card, StatCard } from '@ui/@atoms';
import {
	ActivityRow,
	ClassRankingList,
	CulturalGuideCard,
	SectionPanel,
	CharacterSelect,
	WelcomeStudent,
} from '@ui/@molecules';
import {
	formatClassRank,
	formatDashboardScore,
	formatRelativeTime,
} from './student-dashboard.utils';

import { useCharacter } from '@etnos/tools';
import { Modal } from 'antd';
import { useState } from 'react';
import { trackGameSelected } from '@etnos/analytics/web';

export interface StudentDashboardProps {
	data: StudentDashboardInterface;
}

const EmptyState = ({ onSelectGuide }: { onSelectGuide: () => void }) => {
	return (
		<Card className="ui:flex ui:flex-col ui:gap-3 md:ui:flex-row md:ui:items-center md:ui:justify-between">
			<div>
				<p className="ui:m-0 ui:text-[10px] ui:font-bold ui:uppercase ui:tracking-wide ui:text-slate-500">
					Seu guia cultural
				</p>
				<p className="ui:m-0 ui:text-lg ui:font-black ui:text-primary">
					Escolha um personagem para começar
				</p>
			</div>
			<Button onClick={onSelectGuide} type="secondary" size="small">
				Escolher guia
			</Button>
		</Card>
	);
};

export const StudentDashboard = ({ data }: StudentDashboardProps) => {
	const [openCharacter, setOpenCharacter] = useState(false);

	const toggleCharacter = () => setOpenCharacter(!openCharacter);

	const { selectCharacter } = useCharacter({
		fetchList: false,
	});

	const getGameUrl = (slug: string) => {
		return `/estudante/jogos/${GameUrlEnum[slug as keyof typeof GameUrlEnum]}?personagem=${data.culturalGuide?.slug}`;
	};

	return (
		<div className="ui:flex ui:flex-col ui:gap-6 ui:py-6 ui:md:py-10">
			<WelcomeStudent name={data.user.name} />

			<div className="ui:grid ui:grid-cols-2 ui:gap-2 ui:md:grid-cols-4">
				<StatCard
					label="Pontuação total"
					value={formatDashboardScore(data.user.totalScore)}
					icon="🏆"
				/>
				<StatCard
					label="Jogos concluídos"
					value={data.user.gamesCompleted}
					icon="🎮"
				/>
				<StatCard
					label="Ranking da turma"
					value={formatClassRank(data.user.classRank)}
					icon="🏅"
				/>
				<StatCard
					label="Alunos na escola"
					value={data.user.schoolStudentsCount}
					icon="👥"
				/>
			</div>

			{data.culturalGuide ? (
				<CulturalGuideCard
					guide={data.culturalGuide}
					onChangeGuide={toggleCharacter}
				/>
			) : (
				<EmptyState onSelectGuide={toggleCharacter} />
			)}

			<section className="ui:grid ui:gap-6 ui:md:grid-cols-3">
				<SectionPanel title="Ranking da turma">
					<ClassRankingList entries={data.classRanking} />
				</SectionPanel>

				<SectionPanel title="Jogos disponíveis">
					{data.culturalGuide ? (
						<div className="ui:grid ui:grid-cols-2 ui:gap-4">
							{data.availableGames.map((game) => (
								<Link
									href={getGameUrl(game.slug)}
									key={game.slug}
									className="ui:w-full ui:flex ui:flex-col ui:rounded ui:overflow-hidden ui:border ui:border-slate-200"
									onClick={() =>
										trackGameSelected({
											game_slug: game.slug,
											character_slug: data.culturalGuide?.slug ?? '',
											game_name: game.name,
										})
									}
									aria-label={`Jogar ${game.name}`}
								>
									<img
										src={
											game.coverUrl ??
											`/games/${game.slug}/cover/${data.culturalGuide?.slug}.jpg`
										}
										alt={game.name}
									/>

									<div className="ui:px-2 ui:py-4 ui:text-center ui:text-xs ui:font-bold ui:text-primary">
										{game.name}
									</div>
								</Link>
							))}
						</div>
					) : (
						<EmptyState onSelectGuide={toggleCharacter} />
					)}
				</SectionPanel>

				<SectionPanel title="Atividade recente">
					{data.recentActivity.length === 0 ? (
						<p className="ui:m-0 ui:text-sm ui:text-slate-500">
							Nenhuma atividade recente. Jogue para ver seu histórico aqui.
						</p>
					) : (
						<div className="ui:flex ui:flex-col ui:gap-4">
							{data.recentActivity.map((activity) => (
								<ActivityRow
									key={activity.id}
									activity={activity}
									relativeTime={formatRelativeTime(activity.timestamp)}
								/>
							))}
						</div>
					)}
				</SectionPanel>
			</section>

			<Modal
				title="Selecione um personagem"
				open={openCharacter}
				footer={null}
				onCancel={toggleCharacter}
			>
				<CharacterSelect
					characters={data.characters}
					selectedCharacter={data.culturalGuide ?? undefined}
					onSelect={(character: CharacterInterface) =>
						selectCharacter(character.slug)
					}
				/>
			</Modal>
		</div>
	);
};
