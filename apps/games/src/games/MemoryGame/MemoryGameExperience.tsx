'use client';

import { useEffect, useMemo, useState } from 'react';
import {
	RiArrowLeftRightFill,
	RiCheckDoubleLine,
	RiStarFill,
	RiTrophyLine,
} from 'react-icons/ri';
import { Spin } from 'antd';
import Image from 'next/image';
import { FinishGame, ScoreHighlight } from '../../components';
import { MemoryGameLevelSelector } from './MemoryGameLevelSelector';
import { useMemoryGame } from './useMemoryGame';
import {
	MemoryGameCardContent,
	MemoryGameLevel,
	MemoryGameSound,
} from './memory-game.types';
import { CharacterInterface } from '@etnos/types';
import {
	getAvailableMemoryGameLevels,
	getMemoryGameLevelConfig,
	getMemoryGameLevelContent,
} from './memory-game.utils';

type MemoryGameExperienceProps = {
	content: MemoryGameCardContent[];
	bestScore?: number;
	coverImage?: string;
	isLoading?: boolean;
	matchDelayMs?: number;
	onPlaySound?: (sound: MemoryGameSound) => void;
	onSaveScore?: (score: number) => Promise<void> | void;
	selectedCharacter?: CharacterInterface;
};

export const MemoryGameExperience = ({
	bestScore = 0,
	content,
	coverImage,
	isLoading = false,
	matchDelayMs,
	onPlaySound,
	onSaveScore,
	selectedCharacter,
}: MemoryGameExperienceProps) => {
	const availableLevels = useMemo(
		() => getAvailableMemoryGameLevels(content.length),
		[content.length]
	);
	const [selectedLevel, setSelectedLevel] = useState<MemoryGameLevel | null>(
		null
	);
	const [levelContent, setLevelContent] = useState<MemoryGameCardContent[]>([]);

	useEffect(() => {
		if (!availableLevels.length) {
			setSelectedLevel(null);
			setLevelContent([]);
			return;
		}

		setSelectedLevel((currentLevel) => {
			if (!currentLevel) {
				return null;
			}

			return availableLevels.some((level) => level.level === currentLevel)
				? currentLevel
				: null;
		});
	}, [availableLevels]);

	useEffect(() => {
		if (!selectedLevel) {
			return;
		}

		setLevelContent(getMemoryGameLevelContent(content, selectedLevel));
	}, [content, selectedLevel]);

	const currentLevelConfig = selectedLevel
		? getMemoryGameLevelConfig(selectedLevel)
		: undefined;

	const {
		cards,
		handleCardClick,
		initializeGame,
		isFinished,
		matchedPairs,
		moves,
		score,
		totalPairs,
	} = useMemoryGame({
		content: levelContent,
		levelConfig: currentLevelConfig,
		matchDelayMs,
		onPlaySound,
	});

	const handleSelectLevel = (level: MemoryGameLevel) => {
		setSelectedLevel(level);
		setLevelContent(getMemoryGameLevelContent(content, level));
	};

	const handleRestart = () => {
		setLevelContent(
			selectedLevel ? getMemoryGameLevelContent(content, selectedLevel) : []
		);

		initializeGame();
	};

	const handleSaveScore = async () => {
		await onSaveScore?.(score);
	};

	return (
		<Spin spinning={isLoading}>
			<div className='flex flex-col items-center gap-6'>
				<div className='fixed bg-white py-2 px-2 shadow-[0px_-4px_4px_0px_rgba(0,_0,_0,_0.05)] md:shadow-none md:p-0 md:bg-transparent md:relative bottom-0 left-0 w-full z-10'>
					<div className='grid grid-cols-4 gap-1 md:grid-cols-4 sm:gap-4 w-full'>
						<ScoreHighlight
							icon={<RiTrophyLine />}
							label='Pontuação'
							score={score}
							className='bg-yellow-500 bg-text'
						/>
						<ScoreHighlight
							icon={<RiArrowLeftRightFill />}
							label='Movimentos'
							score={moves}
							className='bg-blue-600 text-white'
						/>
						<ScoreHighlight
							icon={<RiCheckDoubleLine />}
							label='Acertos'
							score={`${matchedPairs}/${totalPairs}`}
							className='bg-emerald-700 text-white'
						/>
						<ScoreHighlight
							icon={<RiStarFill />}
							label='Recorde'
							score={bestScore}
							className='bg-primary text-white'
						/>
					</div>
				</div>

				{!selectedLevel ? (
					<MemoryGameLevelSelector
						availableLevels={availableLevels}
						content={content}
						onSelectLevel={handleSelectLevel}
						selectedCharacter={selectedCharacter}
					/>
				) : isFinished ? (
					<FinishGame
						selectedCharacter={selectedCharacter}
						isLoading={isLoading}
						isLoser={false}
						handleRestart={handleRestart}
						handleSaveScore={handleSaveScore}
					/>
				) : (
					<div className='grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 sm:gap-4 lg:grid-cols-8 w-full'>
						{cards.map((card) => (
							<button
								key={card.id}
								onClick={() => handleCardClick(card.id)}
								className={`
									relative rounded-lg shadow-md aspect-square w-full
									cursor-pointer transform transition-transform duration-500
									${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
									${card.isMatched ? 'opacity-50 pointer-events-none' : ''}
								`}
								style={{ perspective: '1000px' }}
							>
								<div
									className={`absolute inset-0 rounded-lg flex items-center justify-center transform transition-transform duration-500 backface-hidden ${card.isFlipped || card.isMatched ? 'rotate-y-180' : 'rotate-y-0'}`}
								>
									<Image
										src={coverImage ?? ''}
										alt={selectedCharacter?.name ?? 'Carta virada'}
										width={500}
										height={500}
										className='object-cover aspect-square rounded'
									/>
								</div>

								<div
									className={`absolute inset-0 backface-hidden rounded-lg overflow-hidden transform transition-transform duration-500 ${card.isFlipped || card.isMatched ? 'rotate-y-0' : 'rotate-y-180'}`}
								>
									<Image
										src={card.image}
										alt={card.name}
										width={500}
										height={500}
										className='object-cover aspect-square rounded'
									/>
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		</Spin>
	);
};
